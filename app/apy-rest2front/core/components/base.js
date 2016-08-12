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
            return '' + this.$value;
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
            var self = this;
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
                return new ApyMediaFile(self.$endpoint);
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
            this.$value = value;
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
                throw new ApyError('Validation Error: ' + errors.join(', '));
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

        function clone(parent, value) {
            if(!this.$Class) {
                throw new ApyError('No $Class property set !');
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

        // StateHolder known states list (CRUD).
        var STATES = {
            CREATE: 'CREATE',
            READ: 'READ',
            UPDATE: 'UPDATE',
            DELETE: 'DELETE'
        };

        /**
         * Set Component's inner StateHolder instance to the given state
         *
         * @param state: The state, must be one of the STATES list
         * @returns {this}
         */
        function setState (state) {
            this.$states.set(state);
            return this;
        }

        /**
         * Factory method to get a StateHolder instance
         *
         * @param states: A list of known states
         * @param initialState: The initial state (must be one of the `states` list.
         */
        function createStateHolder (initialState, states) {
            return new ApyStateHolder(initialState || STATES.READ, states || STATES);
        }

        /**
         * Factorize logic
         * Return whether or not the Resource's
         * current state is in the passed state
         *
         * @returns {boolean}
         */
        function isState(state) {
            return this.$states.$current === state;
        }

        /**
         * Indicate when the Resource inner state is equal to CREATE
         *
         * @returns {boolean}
         */
        function inCreateState() {
            return this.isState(STATES.CREATE);
        }

        /**
         * Indicate when the Resource inner state is equal to READ
         *
         * @returns {boolean}
         */
        function inReadState() {
            return this.isState(STATES.READ);
        }

        /**
         * Indicate when the Resource inner state is equal to UPDATE
         *
         * @returns {boolean}
         */
        function inUpdateState() {
            return this.isState(STATES.UPDATE);
        }

        /**
         * Indicate when the Resource inner state is equal to DELETE
         *
         * @returns {boolean}
         */
        function inDeleteState() {
            return this.isState(STATES.DELETE);
        }

        /**
         * Set the Resource inner state to CREATE
         *
         * @returns {this}
         */
        function setCreateState () {
            this.setState(STATES.CREATE);
            return this;
        }

        /**
         * Set the Resource inner state to READ
         *
         * @returns {this}
         */
        function setReadState () {
            this.setState(STATES.READ);
            return this;
        }

        /**
         * Set the Resource inner state to UPDATE
         *
         * @returns {this}
         */
        function setUpdateState () {
            this.setState(STATES.UPDATE);
            return this;
        }

        /**
         * Set the Resource inner state to DELETE
         *
         * @returns {this}
         */
        function setDeleteState () {
            this.setState(STATES.DELETE);
            return this;
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
            this.isState = isState;
            this.oneMore = oneMore;
            this.prepend = prepend;
            this.toString = toString;
            this.getChild = getChild;
            this.setValue = setValue;
            this.setState = setState;
            this.validate = validate;
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
            this.inReadState = inReadState;
            this.setReadState = setReadState;
            this.inCreateState = inCreateState;
            this.inUpdateState = inUpdateState;
            this.inDeleteState = inDeleteState;
            this.setCreateState = setCreateState;
            this.setUpdateState = setUpdateState;
            this.setDeleteState = setDeleteState;
            this.createPolyField = createPolyField;
            this.createStateHolder = createStateHolder;
            return this;
        };
    })();

})(window);
