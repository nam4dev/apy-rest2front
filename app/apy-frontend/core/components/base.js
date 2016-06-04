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
 *  Apy Composite base component abstraction (field, resource, collection)
 *
 *  """
 */

(function ($window) {

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
        COLLECTION: "collection"
    };

    /**
     * Component Interface for the "tree" pattern implementation.constructor.
     * Note: This can be inherited but not instantiated.
     *
     * @type function
     */
        // Registering mixin globally
    $window.ApyComponentMixin = (function() {

        /**
         *
         * @param message
         * @returns {this}
         */
        function log(message) {
            if(!this.hasOwnProperty('logging')) {
                alert(message);
            }
            this.$logging.log(message);
            return this;
        }
        /**
         *
         * @param child
         * @returns {this}
         */
        function add(child) {
            this.$components.push(child);
            return this;
        }
        /**
         *
         * @param child
         * @returns {this}
         */
        function prepend(child) {
            this.$components.unshift(child);
            return this;
        }
        /**
         *
         * @returns {Number}
         */
        function count() {
            return this.$components.length;
        }
        /**
         *
         * @param child
         * @returns {this}
         */
        function remove(child) {
            var length = this.count();
            for (var i = 0; i < length; i++) {
                if (this.getChild(i) === child) {
                    this.$components.splice(i, 1);
                    break;
                }
            }
            return this;
        }
        /**
         *
         * @param i
         * @returns {*}
         */
        function getChild(i) {
            return this.$components[i];
        }
        /**
         *
         * @returns {boolean}
         */
        function hasChildren() {
            return this.$components.length > 0;
        }
        /**
         *
         * @returns {Array}
         */
        function cleanedData() {
            var cleaned = [];
            this.$components.filter(function (comp) {
                return comp.hasUpdated();
            }).forEach(function (comp) {
                cleaned.push(comp.cleanedData());
            });
            return cleaned;
        }

        /**
         *
         * @returns {initRequest}
         */
        function initRequest() {
            return this;
        }

        function initialize(service, name, components, type) {
            var self = this;
            this.$types = $TYPES;
            this.$service = service;
            this.$logging = service.$log;
            this.$typesMap = {
                number: [
                    $TYPES.FLOAT,
                    $TYPES.NUMBER,
                    $TYPES.INTEGER
                ],
                object: [
                    $TYPES.DICT,
                    $TYPES.LIST,
                    $TYPES.BOOLEAN,
                    $TYPES.DATETIME,
                    $TYPES.OBJECTID,
                    $TYPES.RESOURCE,
                ]
            };
            this.$typeFactories = {};
            this.$typeFactories[$TYPES.LIST] = function () {
                return [];
            };
            this.$typeFactories[$TYPES.DICT] = function () {
                return {};
            };
            this.$typeFactories[$TYPES.POLY] = function () {
                return undefined;
            };
            this.$typeFactories[$TYPES.MEDIA] = function () {
                return new ApyMediaFile(this.$endpoint, {});
            };
            this.$typeFactories[$TYPES.FLOAT] = function () {
                return 0.0;
            };
            this.$typeFactories[$TYPES.NUMBER] = function () {
                return 0;
            };
            this.$typeFactories[$TYPES.STRING] = function () {
                return "";
            };
            this.$typeFactories[$TYPES.BOOLEAN] = function () {
                return false;
            };
            this.$typeFactories[$TYPES.INTEGER] = function () {
                return 0;
            };
            this.$typeFactories[$TYPES.OBJECTID] = function () {
                return {_id: undefined};
            };
            this.$typeFactories[$TYPES.DATETIME] = function () {
                return new Date();
            };
            this.$typeFactories[$TYPES.RESOURCE] = function () {
                return {};
            };
            this.$fieldTypesMap = {
                float: $TYPES.NUMBER,
                integer: $TYPES.NUMBER,
                dict: $TYPES.RESOURCE
            };
            this.$name = name;
            this.$type = type;
            // Dependencies inherited from Angular
            this.$request = null;
            this.$http = service.$http;
            this.$logging = service.$log;
            this.$upload = service.$upload;
            // components index
            this.$components = components || [];
            this.$components = this.isArray(this.$components) ? this.$components : [this.$components];
            this.$typesForPoly = [];
            Object.keys(this.$types).forEach(function (k) {
                var type = self.$types[k];
                if([$TYPES.COLLECTION, $TYPES.DICT, $TYPES.POLY, $TYPES.INTEGER, $TYPES.FLOAT].indexOf(type) === -1) {
                    self.$typesForPoly.push(type);
                }
            });
            self.$typesForPoly.sort();
            // Design related
            if(this.$fieldTypesMap.hasOwnProperty(type)) {
                type = this.$fieldTypesMap[type];
            }
            this.$contentUrl = 'field-' + type + '.html';
            return this.initRequest();
        }

        function validate() {
            return true;
        }

        /**
         *
         * @param char
         * @param field
         * @returns {boolean}
         */
        function shallContinue (field, char) {
            char = char || '_';
            return field.startsWith && field.startsWith(char);
        }

        function setParent (parent) {
            this.$parent = parent;
            return this;
        }

        function load (args) {
            return this;
        }

        function json (indent) {
            return JSON.stringify(this, null, indent || 4);
        }

        /**
         *
         */
        function loadValue () {
            var all = '';
            var self = this;
            this.$value = '';
            this.$components.forEach(function (component) {
                var v = component.$value;
                if(v && !isDate(v) && !isBoolean(v)) {
                    var value = v + ', ';
                    all += value;
                    if(component.$required) {
                        self.$value += value;
                    }
                }
            });
            if(!this.$value && all) {
                this.$value = all;
            }
            if(this.$value.endsWith(', '))
                this.$value = this.$value.slice(0, -2);
        }

        function clone(parent, value) {
            var instance = new this.$Class(this.$service,
                this.$name, this.$schema, value, this.$states,
                this.$endpoint, this.$type, this.$relationName);
            instance.setParent(parent || this.$parent);
            return instance;
        }

        return function() {
            this.add = add;
            this.json = json;
            this.load = load;
            this.clone = clone;
            this.count = count;
            this.remove = remove;
            this.init = initialize;
            this.prepend = prepend;
            this.getChild = getChild;
            this.validate = validate;
            this.loadValue = loadValue;
            this.setParent = setParent;
            this.isArray = Array.isArray;
            this.isFunction = isFunction;
            this.continue = shallContinue;
            this.initRequest = initRequest;
            this.cleanedData = cleanedData;
            this.hasChildren = hasChildren;
            this.$log = this.$logging = log;
            return this;
        };
    })();

})(window);
