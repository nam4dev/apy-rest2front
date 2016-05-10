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
 *  Apy base field abstraction
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
            for (var i = 0; i < this.count(); i++) {
                var item = this.getChild(i);
                if(item.hasUpdated())
                    cleaned.push(item.cleanedData());
            }
            return cleaned;
        }

        /**
         *
         * @returns {initRequest}
         */
        function initRequest() {
            return this;
        }

        function initialize(service, name, type, components) {

            var self = this;
            this.$types = $TYPES;
            this.$service = service;
            this.$logging = service.$log;
            this.$components = [];
            this.$typesMap = {
                number: [

                    $TYPES.FLOAT,
                    $TYPES.NUMBER,
                    $TYPES.INTEGER
                ],
                object: [
                    $TYPES.DICT,
                    $TYPES.LIST,
                    $TYPES.POLY,
                    $TYPES.DATETIME,
                    $TYPES.OBJECTID
                ]
            };
            this.$fieldTypesMap = {
                float: $TYPES.NUMBER,
                integer: $TYPES.NUMBER,
                dict: $TYPES.RESOURCE
            };
            this.$name = name;
            this.$type = type;
            // Dependencies inherited from Angular
            this.$http = service.$http;
            this.$request = null;
            this.$logging = service.$log;
            this.$upload = service.$upload;
            // components index
            this.$components = components || [];
            this.$components = this.isArray(this.$components) ? this.$components : [this.$components];
            this.$typesForPoly = [];
            forEach(this.$types, function (type) {
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
            if(!this.validate()) {
                throw new Error('Field', this.$name, 'does not validate !');
            }
            return this.initRequest();
        }

        function validate() {
            return true;
        }

        return function() {
            this.add = add;
            this.count = count;
            this.remove = remove;
            this.init = initialize;
            this.prepend = prepend;
            this.isArray = Array.isArray;
            this.getChild = getChild;
            this.validate = validate;
            this.isFunction = isFunction;
            this.initRequest = initRequest;
            this.cleanedData = cleanedData;
            this.hasChildren = hasChildren;
            this.$log = this.$logging = log;
            return this;
        };
    })();

})(window);
