/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy Frontend.
 *  For UI components (data representation & bindings), AngularJs is used.
 *  Anyhow, the framework is intended to be plugged to any UI or Backend framework...
 *
 *  Copyright (C) 2016  (apy) Namgyal Brisson
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:

 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.

 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 *  `apy-frontend`  Copyright (C) 2016  (apy) Namgyal Brisson.
 *
 *  """
 *  Groups all utilities functions
 *
 *  """
 */

(function ($window) {'use strict';

    /**
     *
     */
    var patchObject = function () {
        if (!Object.assign) {
            Object.defineProperty(Object, 'assign', {
                enumerable: false,
                configurable: true,
                writable: true,
                value: function(target) {
                    'use strict';
                    if (target === undefined || target === null) {
                        throw new TypeError('Cannot convert first argument to object');
                    }

                    var to = Object(target);
                    for (var i = 1; i < arguments.length; i++) {
                        var nextSource = arguments[i];
                        if (nextSource === undefined || nextSource === null) {
                            continue;
                        }
                        nextSource = Object(nextSource);

                        var keysArray = Object.keys(nextSource);
                        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                            var nextKey = keysArray[nextIndex];
                            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                            if (desc !== undefined && desc.enumerable) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                    return to;
                }
            });
        }
    };

    /**
     *
     */
    var patchString = function () {
        /**
         *
         * @param target
         * @param replacement
         * @returns {string}
         */
        String.prototype.replaceAll = function(target, replacement) {
            return this.split(target).join(replacement);
        };

        /**
         *
         * @returns {string}
         */
        String.prototype.capitalize = function() {
            var lower = this.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        };
    };

    var NODE_TYPE_ELEMENT = 1;

    var getPrototypeOf      = Object.getPrototypeOf,
        toString            = Object.prototype.toString,
        hasOwnProperty      = Object.prototype.hasOwnProperty;

// Borrowed to AngularJs framework
    /**
     * @name forEach
     * @kind function
     *
     * @description
     * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
     * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
     * is the value of an object property or an array element, `key` is the object property key or
     * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
     *
     * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
     * using the `hasOwnProperty` method.
     *
     * Unlike ES262's
     * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
     * Providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
     * return the value provided.
     *
     ```js
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     forEach(values, function(value, key) {
           this.push(key + ': ' + value);
         }, log);
     expect(log).toEqual(['name: misko', 'gender: male']);
     ```
     *
     * @param {Object|Array} obj Object to iterate over.
     * @param {Function} iterator Iterator function.
     * @param {Object=} context Object to become context (`this`) for the iterator function.
     * @returns {Object|Array} Reference to `obj`.
     */
    function forEach(obj, iterator, context) {
        var key, length;
        if (obj) {
            if (isFunction(obj)) {
                for (key in obj) {
                    // Need to check if hasOwnProperty exists,
                    // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                    if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (isArray(obj) || isArrayLike(obj)) {
                var isPrimitive = typeof obj !== 'object';
                for (key = 0, length = obj.length; key < length; key++) {
                    if (isPrimitive || key in obj) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context, obj);
            } else if (isBlankObject(obj)) {
                // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
                for (key in obj) {
                    iterator.call(context, obj[key], key, obj);
                }
            } else if (typeof obj.hasOwnProperty === 'function') {
                // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else {
                // Slow path for objects which do not have a method `hasOwnProperty`
                for (key in obj) {
                    if (hasOwnProperty.call(obj, key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        }
        return obj;
    }

    /**
     * @name isUndefined
     * @kind function
     *
     * @description
     * Determines if a reference is undefined.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is undefined.
     */
    function isUndefined(value) {return typeof value === 'undefined';}

    /**
     * @name isDefined
     * @kind function
     *
     * @description
     * Determines if a reference is defined.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is defined.
     */
    function isDefined(value) {return typeof value !== 'undefined';}

    /**
     * @name isObject
     * @kind function
     *
     * @description
     * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
     * considered to be objects. Note that JavaScript arrays are objects.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is an `Object` but not `null`.
     */
    function isObject(value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    }

    /**
     * Determine if a value is an object with a null prototype
     *
     * @returns {boolean} True if `value` is an `Object` with a null prototype
     */
    function isBlankObject(value) {
        return value !== null && typeof value === 'object' && !getPrototypeOf(value);
    }

    /**
     * @name isString
     * @kind function
     *
     * @description
     * Determines if a reference is a `String`.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `String`.
     */
    function isString(value) {return typeof value === 'string';}

    /**
     * @name isNumber
     * @kind function
     *
     * @description
     * Determines if a reference is a `Number`.
     *
     * This includes the "special" numbers `NaN`, `+Infinity` and `-Infinity`.
     *
     * If you wish to exclude these then you can use the native
     * [`isFinite'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)
     * method.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Number`.
     */
    function isNumber(value) {return typeof value === 'number';}

    /**
     * @name isDate
     * @kind function
     *
     * @description
     * Determines if a value is a date.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Date`.
     */
    function isDate(value) {
        return toString.call(value) === '[object Date]';
    }

    /**
     * @name isArray
     * @kind function
     *
     * @description
     * Determines if a reference is an `Array`.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is an `Array`.
     */
    var isArray = Array.isArray;

    /**
     * @name isFunction
     * @kind function
     *
     * @description
     * Determines if a reference is a `Function`.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Function`.
     */
    function isFunction(value) {return typeof value === 'function';}

    /**
     * Determines if a value is a regular expression object.
     *
     * @private
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `RegExp`.
     */
    function isRegExp(value) {
        return toString.call(value) === '[object RegExp]';
    }

    /**
     * Checks if `obj` is a window object.
     *
     * @private
     * @param {*} obj Object to check
     * @returns {boolean} True if `obj` is a window obj.
     */
    function isWindow(obj) {
        return obj && obj.window === obj;
    }

    /**
     *
     * @param obj
     * @returns {boolean}
     */
    function isFile(obj) {
        return toString.call(obj) === '[object File]';
    }

    /**
     *
     * @param obj
     * @returns {boolean}
     */
    function isFormData(obj) {
        return toString.call(obj) === '[object FormData]';
    }

    /**
     *
     * @param obj
     * @returns {boolean}
     */
    function isBlob(obj) {
        return toString.call(obj) === '[object Blob]';
    }

    /**
     *
     * @param value
     * @returns {boolean}
     */
    function isBoolean(value) {
        return typeof value === 'boolean';
    }

    /**
     *
     * @param obj
     * @returns {*|boolean}
     */
    function isPromiseLike(obj) {
        return obj && isFunction(obj.then);
    }

    /**
     * @private
     * @param {*} obj
     * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
     *                   String ...)
     */
    function isArrayLike(obj) {
        if (obj == null || isWindow(obj)) {
            return false;
        }

        // Support: iOS 8.2 (not reproducible in simulator)
        // "length" in obj used to prevent JIT error (gh-11508)
        var length = "length" in Object(obj) && obj.length;

        if (obj.nodeType === NODE_TYPE_ELEMENT && length) {
            return true;
        }

        return isString(obj) || isArray(obj) || length === 0 ||
            typeof length === 'number' && length > 0 && (length - 1) in obj;
    }

    // Enum of known types
    var $TYPES = {
        LIST: "list",
        DICT: "dict",
        POLY: "poly",
        MEDIA: "media",
        FLOAT: "float",
        NUMBER: "number",
        STRING: "string",
        BOOLEAN: "boolean",
        INTEGER: "integer",
        OBJECTID: "objectid",
        DATETIME: "datetime",
        RESOURCE: "resource",
        POLYLIST: "poly-list",
        COLLECTION: "collection"
    };

    /**
     *
     * @param $endpoint
     * @param value
     * @constructor
     */
    var ApyMediaFile = function ApyMediaFile($endpoint, value) {
        $endpoint = $endpoint || "";
        if($endpoint && $endpoint.endsWith && $endpoint.endsWith('/')) {
            $endpoint = $endpoint.slice(0, -1);
        }

        this.$uri = null;
        this.$endpoint = $endpoint;

        this.load(value);
    };

    /**
     *
     * @param $file
     */
    ApyMediaFile.prototype.setFile = function ($file) {
        if(isFile($file) || isObject($file)) {
            this.$file = $file.file || $file;
            this.$name = $file.name || this.$name;
            this.$type = $file.type || $file.content_type || this.$type;
            this.$isImage = this.$type ? this.$type.indexOf('image') !== -1 : false;
            this.$isAudio = this.$type ? this.$type.indexOf('audio') !== -1 : false;
            this.$isVideo = this.$type ? this.$type.indexOf('video') !== -1 : false;
            this.$lastModified = $file.lastModified || this.$lastModified;
            this.$lastModifiedDate = $file.lastModifiedDate || this.$lastModifiedDate;
        }
        var self = this;

        return new Promise(function (resolve, reject) {
            self.loadURI().then(function (uri) {
                if(uri) self.$uri = uri;
                return resolve(uri);
            }).catch(function (e) {
                return reject(e);
            });
        });
    };

    /**
     *
     *
     * @param value
     * @returns {ApyMediaFile}
     */
    ApyMediaFile.prototype.load = function load (value) {
        if(isString(value)) {
            this.$file = value;
        }
        else {
            this.setFile(value);
        }
        return this;
    };

    /**
     *
     * @returns {*}
     */
    ApyMediaFile.prototype.cleanedData = function cleanedData () {
        return isFile(this.$file) ? this.$file: null;
    };

    /**
     *
     * @returns {Promise}
     */
    ApyMediaFile.prototype.loadURI = function loadURI () {
        var self = this;

        function ErrorProxy (error, origin) {
            return {
                self: error,
                message: '' + error,
                origin: origin
            }
        }

        return new Promise(function (resolve, reject) {
            var $reader = new FileReader();
            $reader.onerror = function (e) {
                return reject(new ErrorProxy(e, "$reader.onerror"));
            };
            if(self.$isImage && isBlob(self.$file) || isFile(self.$file)) {
                $reader.onload = function (evt) {
                    self.$file.isLoaded = true;
                    self.$file.$result = evt.target.result;
                    return resolve(evt.target.result);
                };

                if(self.$file.isLoaded) return resolve(self.$file.$result);

                try {
                    $reader.readAsDataURL(self.$file);
                }
                catch (e) {
                    return reject(new ErrorProxy(e, "$reader.readAsDataURL"));
                }

            }
            //else if(self.$isVideo || isBlob(self.$file) || isFile(self.$file) || isObject(self.$file) || !self.$file) {
            //    var url = null;
            //    if(self.$file)
            //        url = URL.createObjectURL(self.$file);
            //    return resolve(url);
            //}
            else {
                return resolve(self.$endpoint + self.$file);
            }
        });
    };

    /**
     *
     * @param initialState
     * @param states
     * @constructor
     */
    var ApyStateHolder = function (initialState, states) {
        this.$states = states;
        this.$current = initialState;
        this.load();
    };

    /**
     *
     * @param state
     * @returns {ApyStateHolder}
     */
    ApyStateHolder.prototype.set = function (state) {
        this.$current = state;
        return this;
    };

    /**
     *
     * @returns {ApyStateHolder}
     */
    ApyStateHolder.prototype.load = function () {
        var self = this;
        forEach(this.$states, function (value) {
            var attr = value.toUpperCase();
            self[attr] = attr;
        });
        return this;
    };

    patchObject();
    patchString();

    $window.apy = $window.apy || {};
    $window.apy.common = $window.apy.common || {};

    $window.$TYPES = $TYPES;
    $window.forEach = forEach;
    $window.isUndefined = isUndefined;
    $window.isDefined = isDefined;
    $window.isObject = isObject;
    $window.isBlankObject = isBlankObject;
    $window.isString = isString;
    $window.isNumber = isNumber;
    $window.isDate = isDate;
    $window.isFunction = isFunction;
    $window.isRegExp = isRegExp;
    $window.isWindow = isWindow;
    $window.isFile = isFile;
    $window.isFormData = isFormData;
    $window.isBlob = isBlob;
    $window.isBoolean = isBoolean;
    $window.isPromiseLike = isPromiseLike;
    $window.isArrayLike = isArrayLike;
    $window.ApyMediaFile = ApyMediaFile;
    $window.ApyStateHolder = ApyStateHolder;
    $window.ApyStackComponent = ApyStateHolder;

    /**
     * Common behaviour
     *
     * @returns {Class}
     */
    function getFieldClassByType(type) {
        // following naming convention
        type = type.capitalize();
        var fieldClassName = 'Apy' + type + 'Field';
        if(!$window.hasOwnProperty(fieldClassName)) return null;
        return $window[fieldClassName];
    }

    var mapping = {
        'float': 'number',
        'integer': 'number',
        'dict': 'hashmap',
        'resource': 'hashmap',
        'objectid': 'embedded'
    };

    $window.apy.common.fieldClassByType = function fieldClassByType(type) {
        type = type || 'poly';
        if(type !== 'collection') {
            if(mapping.hasOwnProperty(type)) {
                type = mapping[type];
            }
            return getFieldClassByType(type);
        }
        return null;
    };



})(window);
