/**
 *  @license
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy REST2Front.
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
 *  `apy-rest2front`  Copyright (C) 2016  (apy) Namgyal Brisson.
 */
/**
 * Groups all utilities functions
 *
 * @namespace apy.helpers
 */
(function ( $apy ) {'use strict';

    /**
     * @memberOf apy.helpers
     */
    /* istanbul ignore next */
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
     * @memberOf apy.helpers
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

    var toString = Object.prototype.toString;

    /**
     * @memberOf apy.helpers
     */
    var patchArray = function () {
        if (!Array.isArray) {
            /* istanbul ignore next */
            Array.isArray = function(arg) {
                return toString.call(arg) === '[object Array]';
            };
        }
    };

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
     * @memberOf apy.helpers
     */
    function isObject(value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
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
     * @memberOf apy.helpers
     */
    function isString(value) {return typeof value === 'string';}

    /**
     * @name isDate
     * @kind function
     *
     * @description
     * Determines if a value is a date.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Date`.
     * @memberOf apy.helpers
     */
    function isDate(value) {
        return toString.call(value) === '[object Date]';
    }

    /**
     * @name isFunction
     * @kind function
     *
     * @description
     * Determines if a reference is a `Function`.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Function`.
     * @memberOf apy.helpers
     */
    function isFunction(value) {return typeof value === 'function';}

    /**
     *
     * @param obj
     * @returns {boolean}
     * @memberOf apy.helpers
     */
    function isFile(obj) {
        return toString.call(obj) === '[object File]';
    }

    /**
     *
     * @param obj
     * @returns {boolean}
     * @memberOf apy.helpers
     */
    function isBlob(obj) {
        return toString.call(obj) === '[object Blob]';
    }

    /**
     * Enum of known types
     *
     * @memberOf apy.helpers
     * @type {{
     * LIST: string,
     * DICT: string,
     * POLY: string,
     * MEDIA: string,
     * POINT: string,
     * FLOAT: string,
     * NUMBER: string,
     * NESTED: string,
     * STRING: string,
     * BOOLEAN: string,
     * INTEGER: string,
     * OBJECTID: string,
     * EMBEDDED: string,
     * DATETIME: string,
     * RESOURCE: string,
     * COLLECTION: string
     * }}
     */
    var $TYPES = {
        LIST: 'list',
        DICT: 'dict',
        POLY: 'poly',
        MEDIA: 'media',
        POINT: 'point',
        FLOAT: 'float',
        NESTED: 'nested',
        NUMBER: 'number',
        STRING: 'string',
        BOOLEAN: 'boolean',
        INTEGER: 'integer',
        EMBEDDED: 'embedded',
        OBJECTID: 'objectid',
        DATETIME: 'datetime',
        RESOURCE: 'resource',
        COLLECTION: 'collection'
    };

    /**
     * Interface for Media Resource
     *
     * @class apy.helpers.MediaFile
     *
     * @param value
     * @param $endpoint
     */
    var MediaFile = function MediaFile($endpoint, value) {
        $endpoint = $endpoint || '';
        if($endpoint && $endpoint.endsWith && $endpoint.endsWith('/')) {
            $endpoint = $endpoint.slice(0, -1);
        }
        this.$uri = null;
        this.$endpoint = $endpoint;
        this.setFile(value);
    };

    /**
     * @memberOf apy.helpers.MediaFile
     */
    MediaFile.prototype.toString = function toString() {
        return '(' + [this.$name, this.$type].join(', ') + ')';
    };

    /**
     *
     * @param $file
     * @memberOf apy.helpers.MediaFile
     */
    MediaFile.prototype.setFile = function ($file) {
        if(isFile($file) || isObject($file)) {
            this.$file = $file.file || $file;
            this.$uri = this.$endpoint + this.$file;
            this.$name = $file.name || this.$name;
            this.$type = $file.type || $file.content_type || this.$type;
            this.$isImage = this.$type ? this.$type.indexOf('image') !== -1 : false;
            this.$isAudio = this.$type ? this.$type.indexOf('audio') !== -1 : false;
            this.$isVideo = this.$type ? this.$type.indexOf('video') !== -1 : false;
            this.$lastModified = $file.lastModified || this.$lastModified;
            this.$lastModifiedDate = $file.lastModifiedDate || this.$lastModifiedDate;
        }
        else if(isString($file)) {
            this.$file = $file;
        }
        return this;
    };

    /**
     *
     * @returns {Object}
     * @memberOf apy.helpers.MediaFile
     */
    MediaFile.prototype.getInfo = function () {
        return {
            file: this.$file,
            name: this.$name,
            type: this.$type,
            lastModified: this.$lastModified,
            lastModifiedDate: this.$lastModifiedDate
        };
    };

    /**
     *
     *
     * @param value
     * @returns {Promise}
     * @memberOf apy.helpers.MediaFile
     */
    MediaFile.prototype.load = function load (value) {
        return this.setFile(value).loadURI();
    };

    /**
     *
     * @returns {*}
     * @memberOf apy.helpers.MediaFile
     */
    MediaFile.prototype.cleanedData = function cleanedData () {
        return isFile(this.$file) ? this.$file: null;
    };

    /**
     *
     * @returns {Promise}
     * @memberOf apy.helpers.MediaFile
     */
    MediaFile.prototype.loadURI = function loadURI () {
        var self = this;

        function ErrorProxy (error, origin) {
            return {
                self: error,
                message: '' + error,
                origin: origin
            };
        }

        return new Promise(function (resolve, reject) {
            var $reader = new FileReader();
            $reader.onerror = function (e) {
                return reject(new ErrorProxy(e, '$reader.onerror'));
            };
            if(self.$isImage && isBlob(self.$file) || isFile(self.$file)) {
                $reader.onload = function (evt) {
                    self.$file.isLoaded = true;
                    self.$uri = self.$file.$result = evt.target.result;
                    return resolve(evt.target.result);
                };

                if(self.$file.isLoaded) {
                    return resolve(self.$file.$result);
                }

                try {
                    $reader.readAsDataURL(self.$file);
                }
                catch (e) {
                    return reject(new ErrorProxy(e, '$reader.readAsDataURL'));
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
     * Keep state among kown ones
     *
     * @class apy.helpers.StateHolder
     *
     * @param states
     * @param initialState
     */
    var StateHolder = function StateHolder(initialState, states) {
        this.$states=states;
        this.$current=initialState;
        this.load();
    };

    /**
     *
     * @param state
     * @returns {StateHolder}
     * @memberOf apy.helpers.StateHolder
     */
    StateHolder.prototype.set = function (state) {
        this.$current=state;
        return this;
    };

    /**
     *
     * @returns {StateHolder}
     * @memberOf apy.helpers.StateHolder
     */
    StateHolder.prototype.load = function () {
        var states = this.$states;
        for(var value in states) {
            if(!states.hasOwnProperty(value)) {
                continue;
            }
            var attr = value.toUpperCase();
            this[attr] = attr;
        }
        return this;
    };

    /**
     * Point interface implements `coordinates` props
     *
     * @class apy.helpers.GeoPoint
     *
     * @param value
     */
    function GeoPoint(value) {
        if(value instanceof GeoPoint) {
            value = value.cleanedData();
        }
        if(Array.isArray(value)) {
            value = {
                coordinates: value
            };
        }
        if(!value) {
            value = {};
        }
        if(!value.hasOwnProperty('type')) {
            value.type = 'Point';
        }
        if(!value.hasOwnProperty('coordinates')) {
            value.coordinates = [-1, -1];
        }

        this.value = value;
        this.x = value.coordinates[0];
        this.y = value.coordinates[1];
        this.coordinates = value.coordinates;
        this.clean();
    }

    /**
     * @memberOf apy.helpers.GeoPoint
     */
    GeoPoint.prototype.clean = function clean() {
        try {
            this.x = parseFloat(this.x);
        }
        catch (e) {
            this.x = parseInt(this.x);
        }
        try {
            this.y = parseFloat(this.y);
        }
        catch (e) {
            this.y = parseInt(this.y);
        }
        this.coordinates = [this.x, this.y];
    };

    /**
     * @memberOf apy.helpers.GeoPoint
     * @returns {{type: string, coordinates: *}}
     */
    GeoPoint.prototype.cleanedData = function cleanedData() {
        this.clean();
        return {
            'type': 'Point',
            coordinates: this.coordinates
        };
    };

    /**
     * Common behaviour
     *
     * @inner _getFieldClassByType
     * @memberOf apy.helpers
     * @returns {*}
     */
    function _getFieldClassByType(type) {
        var className = type.capitalize();
        return (
            apy.components.fields[className] ||
            apy.components.fields.geo[className]
        );
    }

    /**
     * Get any known Field Class by its type
     *
     * @memberOf apy.helpers
     * @param {string} type
     * @returns {*}
     */
    function fieldClassByType(type) {
        type = type || 'poly';
        switch (type) {
        case apy.helpers.$TYPES.DICT:
            type = apy.helpers.$TYPES.NESTED;
            break;
        case apy.helpers.$TYPES.OBJECTID:
            type = apy.helpers.$TYPES.EMBEDDED;
            break;
        default :
            break;
        }
        var fieldClass = _getFieldClassByType(type);
        if(!fieldClass) {
            throw new apy.Error('Unknown type ' + type);
        }
        return fieldClass;
    }

    patchArray();
    patchObject();
    patchString();

    $apy.helpers.$TYPES = $TYPES;
    $apy.helpers.isDate = isDate;
    $apy.helpers.isObject = isObject;
    $apy.helpers.isString = isString;
    $apy.helpers.isFunction = isFunction;

    $apy.helpers.GeoPoint = GeoPoint;
    $apy.helpers.MediaFile = MediaFile;
    $apy.helpers.StateHolder = StateHolder;
    $apy.helpers.fieldClassByType = fieldClassByType;

})( apy );
