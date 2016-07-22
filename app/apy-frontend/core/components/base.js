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
         * @returns {string}
         */
        function toString() {
            var self = this;
            var values = [];
            var excludedTypes = [
                $TYPES.BOOLEAN,
                $TYPES.DATETIME
            ];

            var filtered = this.$components.filter(function (c) {
                return c.$required && excludedTypes.indexOf(c.$type) === -1;
            });

            if(!filtered.length) {
                filtered = this.$components.filter(function (c) {
                    return excludedTypes.indexOf(c.$type) === -1;
                });
            }
            filtered.forEach(function (c) {
                if(c.$value) {
                    var toString = c.toString() || c.$value.toString();
                    if(toString) {
                        values.push(toString);
                    }
                }
            });
            if(values) {
                return '[' + values.join(', ') + ']';
            }
            else {
                return ""
            }
        }

        /**
         *
         * @param message
         * @returns {this}
         */
        function log(message) {
            this.$service && this.$service.$log && this.$service.$log.log(message);
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
            return this.count() > 0;
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
         * @returns {Object}
         */
        function createTypesFactory() {
            var $TYPES = $window.$TYPES;
            var $typesFactory = {};
            $typesFactory[$TYPES.LIST] = function () {
                return [];
            };
            $typesFactory[$TYPES.DICT] = function () {
                return {};
            };
            $typesFactory[$TYPES.POLY] = function () {
                return undefined;
            };
            $typesFactory[$TYPES.MEDIA] = function () {
                return new ApyMediaFile(self.$endpoint, {});
            };
            $typesFactory[$TYPES.FLOAT] = function () {
                return 0.0;
            };
            $typesFactory[$TYPES.NUMBER] = function () {
                return 0;
            };
            $typesFactory[$TYPES.STRING] = function () {
                return "";
            };
            $typesFactory[$TYPES.BOOLEAN] = function () {
                return false;
            };
            $typesFactory[$TYPES.INTEGER] = function () {
                return 0;
            };
            $typesFactory[$TYPES.OBJECTID] = function () {
                return null;
            };
            $typesFactory[$TYPES.DATETIME] = function () {
                return new Date();
            };
            $typesFactory[$TYPES.RESOURCE] = function () {
                return null;
            };
            return $typesFactory;
        }

        function createTypesForPolyField ($types) {
            var $typesForPoly = [];
            Object.keys($types).forEach(function (k) {
                var type = $types[k];
                if([$TYPES.COLLECTION, $TYPES.RESOURCE, $TYPES.POLY, $TYPES.INTEGER, $TYPES.FLOAT].indexOf(type) === -1) {
                    $typesForPoly.push(type);
                }
            });
            $typesForPoly.sort();
            return $typesForPoly;
        }

        function initialize(service, name, schema, value, $states, $endpoint, type, relationName, components) {
            var $TYPES = $window.$TYPES;
            this.__logger = undefined;
            this.$originalValue = this.cloneValue(value);
            this.$types = $TYPES;
            this.$service = service;
            this.$typesFactory = createTypesFactory();
            // FIXME: Dependencies inherited from Frontend framework (here AngularJs)
            this.$http = service.$http;
            this.$upload = service.$upload;
            // components index
            this.$components = components || [];
            this.$components = this.isArray(this.$components) ? this.$components : [this.$components];
            this.$typesForPoly = createTypesForPolyField(this.$types);
            this.$contentUrl = 'field-' + type + '.html';
            this.$name = name;
            this.$type = type;
            this.$states = $states;
            this.$endpoint = $endpoint;
            this.$relationName = relationName;
            this.setOptions(schema)
                .setValue(value);

            this.$Class = $window.ApyComponentMixin;
            return this;
        }

        function setOptions(schema) {
            this.$schema = schema;
            this.$request = (this.$schema && this.$schema.$hasMedia) ? this.$upload.upload : this.$http;
            return this;
        }

        function setValue(value) {
            return this;
        }

        function validate() {
            var errors = [];
            this.$components.forEach(function (component) {
                try {
                    component.validate()
                } catch (error) {
                    errors.push(error);
                }
            });
            if(errors.length) {
                throw new Error('Validation Error: ' + errors.join(', '));
            }
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

        /* istanbul ignore next */
        function load (args) {
            return this;
        }

        /**
         *
         */
        function loadValue () {
            var all = [];
            var required = [];
            if(this.$value !== '') {
                this.$value = '';
            }
            this.$components.forEach(function (component) {
                var v = component.$value;
                if(v && !isDate(v) && !isBoolean(v)) {
                    if(v instanceof ApyPoint) {
                        v.clean();
                        v = component.$name + ' coordinates(' + v.coordinates + ')';
                    }
                    if(v) {
                        all.push(v);
                        if(component.$required) {
                            required.push(v);
                        }
                    }
                }
            });
            if(required.length) {
                this.$value = required.join(', ');
            }
            else if(!required.length && all.length) {
                this.$value = all.join(', ');
            }
        }

        function clone(parent, value) {
            if(!this.$Class) {
                throw new Error('No $Class property set !');
            }
            var instance = new this.$Class(this.$service,
                this.$name, this.$schema, value, this.$states,
                this.$endpoint, this.$type, this.$relationName);
            instance.setParent(parent || this.$parent);
            return instance;
        }

        function cloneChild() {
            var clone = null;
            var self = this;
            var fieldClassByType = $window.apy.common.fieldClassByType;
            function iterOverSchema(schema, name) {
                var cl;
                var relationName;
                switch (schema.type) {
                    case $TYPES.OBJECTID:
                        relationName = schema.data_relation.resource || self.$relationName || name;
                        break;
                    default :
                        relationName = self.$relationName;
                        break;
                }
                var Class = fieldClassByType(schema.type);
                cl = new Class(self.$service, relationName || name, schema.schema, null,
                    self.$states, self.$endpoint, schema.type, relationName);
                return cl;
            }
            try {
                if(this.$schema && this.$schema.schema) {
                    clone = iterOverSchema(this.$schema.schema, this.$name);
                }
                else {
                    clone = this.createPolyField(this.$schema, undefined, this.$name);
                }
            }
            catch (e) {
                console.warn('cloneChild.warning', e);
            }
            return clone;
        }

        function oneMore() {
            var comp = this.cloneChild();
            if(comp) {
                this.add(comp);
            }
            return this;
        }

        function createPolyField (schema, value, name, parent) {
            var field = new ApyPolyField(this.$service, name || this.$name, schema, value,
                this.$states, this.$endpoint, this.$type, this.$relationName);
            field.setParent(parent || this);
            return field;
        }

        /**
         *
         * @param value
         * @returns {*}
         */
        function cloneValue(value) {
            return value;
        }

        /**
         *
         * @returns {boolean}
         */
        function hasUpdated() {
            return this.$value !== this.$memo;
        }

        /**
         *
         */
        function reset() {
            if (this.hasUpdated()) {
                this.$value = this.cloneValue(this.$memo);
            }
        }

        /**
         *
         * @returns {boolean}
         */
        function isReadOnly() {
            var readOnly = 0;
            this.$components.forEach(function (comp) {
                if(comp.readOnly ||
                    (comp.hasOwnProperty('isReadOnly') && comp.isReadOnly())) {
                    readOnly++;
                }
            });
            return this.$components.length === readOnly;
        }

        function data() {
            return this.$originalValue;
        }

        return function() {
            this.add = add;
            this.$log = log;
            this.data = data;
            this.load = load;
            this.clone = clone;
            this.count = count;
            this.reset = reset;
            this.remove = remove;
            this.oneMore = oneMore;
            this.prepend = prepend;
            this.toString = toString;
            this.getChild = getChild;
            this.setValue = setValue;
            this.validate = validate;
            this.loadValue = loadValue;
            this.setParent = setParent;
            this.isReadOnly = isReadOnly;
            this.hasUpdated = hasUpdated;
            this.setOptions = setOptions;
            this.cloneValue = cloneValue;
            this.initialize = initialize;
            this.cloneChild = cloneChild;
            this.isArray = Array.isArray;
            this.isFunction = isFunction;
            this.continue = shallContinue;
            this.cleanedData = cleanedData;
            this.hasChildren = hasChildren;
            this.createPolyField = createPolyField;
            return this;
        };
    })();

})(window);
