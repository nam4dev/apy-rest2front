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
(function($apy) {'use strict';
    /**
     * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
     * considered to be objects. Note that JavaScript arrays are objects.
     *
     * @function isObject
     * @memberOf apy.helpers
     *
     * @param {*} value Reference to check.
     *
     * @returns {boolean} True if `value` is an `Object` but not `null`.
     */
    function isObject(value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    }

    /**
     * Determines if a reference is a `String`.
     *
     * @memberOf apy.helpers
     *
     * @param {*} value Reference to check.
     *
     * @returns {boolean} True if `value` is a `String`.
     */
    function isString(value) {return typeof value === 'string';}

    /**
     * Determines if a number is a `Negative Zero`.
     *
     * @memberOf apy.helpers
     *
     * @param {number} number value Reference to check.
     *
     * @return {boolean} True if `value` is a `Negative Zero`.
     */
    function isNegativeZero(number) {
        return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
    }

    /**
     * Determines if a reference is a `Float`.
     *
     * @memberOf apy.helpers
     *
     * @param {string|number} value value Reference to check.
     *
     * @return {boolean} True if `value` is a `Float`.
     */
    function isFloat(value) {
        return (Object.prototype.toString.call(value) === '[object Number]') &&
            (value % 1 !== 0 || isNegativeZero(value));
    }

    /**
     * Determines if a value is a date.
     *
     * @memberOf apy.helpers
     *
     * @param {*} value Reference to check.
     *
     * @return {boolean} True if `value` is a `Date`.
     */
    function isDate(value) {
        return toString.call(value) === '[object Date]';
    }

    /**
     * Determines if a reference is a `Function`.
     *
     * @memberOf apy.helpers
     *
     * @param {*} value Reference to check.
     *
     * @return {boolean} True if `value` is a `Function`.
     */
    function isFunction(value) {return typeof value === 'function';}

    /**
     * Determines if a reference is a `File` Object.
     *
     * @memberOf apy.helpers
     *
     * @param {*} value Reference to check.
     *
     * @return {boolean}
     */
    function isFile(value) {
        return toString.call(value) === '[object File]';
    }

    /**
     * Determines if a reference is a `Blob` Object.
     *
     * @memberOf apy.helpers
     *
     * @param {*} value Reference to check.
     *
     * @return {boolean}
     */
    function isBlob(value) {
        return toString.call(value) === '[object Blob]';
    }

    /**
     * Enum for Apy component known types
     *
     * @memberOf apy.helpers
     *
     * @readonly
     * @enum {string}
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
     * @example
     * // In case backend returns content_type & name metadata
     * var file = {
     *     file: '/media/<ID>',
     *     content_type: 'image/png',
     *     name: 'media.png'
     * };
     * var endpoint = 'http://tests.org/api/2/';
     * var media = new MediaFile(endpoint, file);
     *
     * console.log(media.$isImage) // true
     * console.log(media.$isAudio) // false
     * console.log(media.$isVideo) // false
     * console.log(media.$uri) // http://tests.org/api/2/media/<ID>'
     *
     * @param {string|Object|File} file A media resource file
     * @param {string} endpoint REST API endpoint base
     */
    function MediaFile(endpoint, file) {
        if($apy.constants.FILE_API_SUPPORTED) {
            endpoint = endpoint || '';
            if (endpoint && endpoint.endsWith && endpoint.endsWith('/')) {
                endpoint = endpoint.slice(0, -1);
            }
            this.$uri = null;
            this.$endpoint = endpoint;
            this.setFile(file);
        }
    }

    /**
     * MediaFile string representation
     *
     * Format: (this.$name, this.$type)
     *
     * @memberOf apy.helpers.MediaFile
     *
     * @todo Fix Media served as a base64 string
     *
     * @return {string} MediaFile string representation
     */
    MediaFile.prototype.toString = function toString() {

        if(!$apy.constants.FILE_API_SUPPORTED) {
            return 'File API is not supported on your browser!'
        }
        else if(this.$name && this.$type) {
            return '(' + [this.$name, this.$type].join(', ') + ')';
        }
        else if(this.$name) {
            return '(' + this.$name + ')';
        }
        else if(this.$type) {
            return '(' + this.$type + ')';
        }
        else if(this.$file) {
            return '(' + this.$file + ')';
        }
        else {
            return '';
        }
    };

    if($apy.constants.FILE_API_SUPPORTED) {

        /**
         * Set given file
         *
         * @memberOf apy.helpers.MediaFile
         *
         * @param {string|Object|File} file A media resource file
         *
         * @return {apy.helpers.MediaFile} `this`
         */
        MediaFile.prototype.setFile = function (file) {
            if (isFile(file) || isObject(file)) {
                this.$file = file.file || file;
                this.$uri = this.$endpoint + this.$file;
                this.$name = file.name || this.$name;
                this.$type = file.type || file.content_type || this.$type;
                this.$isImage = this.$type ? this.$type.indexOf('image') !== -1 : false;
                this.$isAudio = this.$type ? this.$type.indexOf('audio') !== -1 : false;
                this.$isVideo = this.$type ? this.$type.indexOf('video') !== -1 : false;
                this.$lastModified = file.lastModified || this.$lastModified;
                this.$lastModifiedDate = file.lastModifiedDate || this.$lastModifiedDate;
            }
            else if (isString(file)) {
                this.$file = file;
            }
            return this;
        };

        /**
         * Get MediaFile information
         *
         * @example
         * // Below properties returned by `getInfo()`
         * var returnedMediaFileProps = {
     *     file: this.$file,
     *     name: this.$name,
     *     type: this.$type,
     *     lastModified: this.$lastModified,
     *     lastModifiedDate: this.$lastModifiedDate
     * };
         *
         * @memberOf apy.helpers.MediaFile
         *
         * @return {Object} A Proxy File Object
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
         * Load given file and compute matching URI according to media type
         *
         * @memberOf apy.helpers.MediaFile
         *
         * @param {string|Object|File} file A media resource file
         *
         * @return {Promise} Asynchronous call
         */
        MediaFile.prototype.load = function load(file) {
            return this.setFile(file).loadURI();
        };

        MediaFile.prototype.file2base64 = function syncRead() {
            var dataURI = null;
            var file = isFile(this.$file) ? this.$file : null;
            if (file) {
                dataURI = file.$result;
            }
            return dataURI;
        };

        /**
         * Return cleaned data for saving process
         * Only `File` type are returned as Eve does not understand Object
         *
         * @memberOf apy.helpers.MediaFile
         *
         * @return {File|null} Selected File instance or null
         */
        MediaFile.prototype.cleanedData = function cleanedData() {
            // return this.file2base64();
            return isFile(this.$file) ? this.$file : null;
        };

        /**
         * Load asynchronously the file URI.abbrev
         *
         * @todo Fix Audio & Video type display
         *
         * @memberOf apy.helpers.MediaFile
         *
         * @return {Promise} Asynchronous call
         */
        MediaFile.prototype.loadURI = function loadURI() {
            var self = this;

            function ErrorProxy(error, origin) {
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
                if (self.$isImage && isBlob(self.$file) || isFile(self.$file)) {
                    $reader.onload = function (evt) {
                        self.$file.isLoaded = true;
                        self.$uri = self.$file.$result = evt.target.result;
                        return resolve(evt.target.result);
                    };

                    if (self.$file.isLoaded) {
                        return resolve(self.$file.$result);
                    }

                    try {
                        $reader.readAsDataURL(self.$file);
                    }
                    catch (e) {
                        return reject(new ErrorProxy(e, '$reader.readAsDataURL'));
                    }
                }
                // else if(self.$isVideo || isBlob(self.$file) || isFile(self.$file) || isObject(self.$file) || !self.$file) {
                //    var url = null;
                //    if(self.$file)
                //        url = URL.createObjectURL(self.$file);
                //    return resolve(url);
                // }
                else {
                    return resolve(self.$endpoint + self.$file);
                }
            });
        };

    }

    /**
     * Keep state among known ones
     *
     * @class apy.helpers.StateHolder
     *
     * @example
     * var states = {
     *     READ: 'READ',
     *     ERROR: 'ERROR',
     *     CREATE: 'CREATE',
     *     UPDATE: 'UPDATE',
     *     DELETE: 'DELETE'
     * };
     * var initialState = states.READ;
     * var stateHolder = new StateHolder(initialState, states);
     *
     * console.log(stateHolder.$current === states.READ); // true
     * stateHolder.set(states.CREATE)
     * console.log(stateHolder.$current === states.CREATE); // true
     *
     * @param {Object} states An Object representing states
     * @param {string} initialState A state picked from states
     */
    function StateHolder(initialState, states) {
        this.$states = states;
        this.$current = initialState;
        this.load();
    }

    /**
     * Set a state picked from `states` reference
     *
     * @memberOf apy.helpers.StateHolder
     *
     * @param {string} state A state picked from states
     *
     * @return {apy.helpers.StateHolder} `this`
     */
    StateHolder.prototype.set = function(state) {
        this.$current = state;
        return this;
    };

    /**
     * Load all given states into itself
     * All states are upper-cased before being set.
     *
     * @memberOf apy.helpers.StateHolder
     *
     * @return {apy.helpers.StateHolder} `this`
     */
    StateHolder.prototype.load = function() {
        var self = this;
        Object.keys(self.$states).forEach(function (state) {
            var attr = state.toUpperCase();
            self[attr] = attr;
        });
        return this;
    };

    /**
     * Point interface implements type & `coordinates` props.
     *
     * @class apy.helpers.GeoPoint
     *
     * @example
     * var point = new GeoPoint(['1.2255', '41.2258']);
     *
     * console.log(point.coordinates) // [1.2255, 41.2258]
     * console.log(point.cleanedData()) // {'type': 'Point', coordinates: [1.2255, 41.2258]}
     *
     * @param {apy.helpers.GeoPoint|Object} value An Object representing Point
     */
    function GeoPoint(value) {
        if (value instanceof GeoPoint) {
            value = value.cleanedData();
        }
        if (Array.isArray(value)) {
            value = {
                coordinates: value
            };
        }
        value = value || {};
        if (!value.hasOwnProperty('coordinates')) {
            value.coordinates = [-1, -1];
        }

        this.x = value.coordinates[0];
        this.y = value.coordinates[1];
        this.coordinates = value.coordinates;
        this.clean();
    }

    /**
     * Clean value by ensuring their proper type (float or integer)
     *
     * @memberOf apy.helpers.GeoPoint
     */
    GeoPoint.prototype.clean = function clean() {
        var self = this;
        function parse(value, prop) {
            try {
                self[prop] = parseFloat(value);
            }
            catch (e) {
                self[prop] = parseInt(value);
            }
        }
        if (!isFloat(this.x)) {
            parse(this.x, 'x');
        }
        if (!isFloat(this.y)) {
            parse(this.y, 'y');
        }
        this.coordinates = [this.x, this.y];
    };

    /**
     * Get cleaned data
     *
     * Format: {type: string, coordinates: Array}
     *
     * @memberOf apy.helpers.GeoPoint
     *
     * @return {{type: string, coordinates: Array}} An Object representing a Point (GeoJSON)
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
     *
     * @return {*|null} Any Field Class matching type or null
     */
    function _getFieldClassByType(type) {
        var className = type.capitalize();
        return (
            $apy.components.fields[className] ||
            $apy.components.fields.geo[className]
        );
    }

    /**
     * Get any known Field Class by its type
     *
     * @memberOf apy.helpers
     *
     * @param {string} type Field type
     *
     * @return {*|null} Any Field Class matching type or null
     *
     * @throws {apy.errors.Error} If type is not found
     */
    function fieldClassByType(type) {
        type = type || 'poly';
        switch (type) {
            case $apy.helpers.$TYPES.DICT:
                type = $apy.helpers.$TYPES.NESTED;
                break;
            case $apy.helpers.$TYPES.OBJECTID:
                type = $apy.helpers.$TYPES.EMBEDDED;
                break;
            default :
                break;
        }
        var fieldClass = _getFieldClassByType(type);
        if (!fieldClass) {
            throw new $apy.errors.Error('Unknown type ' + type);
        }
        return fieldClass;
    }

    $apy.helpers.$TYPES = $TYPES;
    $apy.helpers.isDate = isDate;
    $apy.helpers.isFile = isFile;
    $apy.helpers.isBlob = isBlob;
    $apy.helpers.isFloat = isFloat;
    $apy.helpers.isString = isString;
    $apy.helpers.isObject = isObject;
    $apy.helpers.isFunction = isFunction;
    $apy.helpers.isNegativeZero = isNegativeZero;

    $apy.helpers.GeoPoint = GeoPoint;
    $apy.helpers.MediaFile = MediaFile;
    $apy.helpers.StateHolder = StateHolder;
    $apy.helpers.fieldClassByType = fieldClassByType;
})(apy);
