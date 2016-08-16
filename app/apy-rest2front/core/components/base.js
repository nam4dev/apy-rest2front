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
/**
 * @namespace apy.components
 */
(function ( $apy ) {

    /**
     * Component Interface for the "tree" pattern implementation.constructor.
     * Note: This can be inherited but not instantiated.
     *
     * @mixin ComponentMixin
     * @memberOf apy.components
     */
        // Registering mixin globally
    $apy.components.ComponentMixin = (function ComponentMixin() {

        /**
         * StateHolder known states list (CRUD).
         *
         * @type {{CREATE: string, READ: string, UPDATE: string, DELETE: string}}
         * @inner apy.components.ComponentMixin
         */
        var STATES = {
            CREATE: 'CREATE',
            READ: 'READ',
            UPDATE: 'UPDATE',
            DELETE: 'DELETE'
        };

        /**
         *
         * @returns {string}
         * @memberOf ComponentMixin
         */
        var toString = function toString() {
            return '' + this.$value;
        };

        /**
         *
         * @param message
         * @returns {this}
         * @memberOf ComponentMixin
         */
        var log = function log(message) {
            this.$service && this.$service.$log && this.$service.$log.log(message);
            return this;
        };

        /**
         *
         * @param child
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var add = function add(child) {
            this.$components.push(child);
            return this;
        };

        /**
         * Prepend to `components`,
         * any child implementing {apy.components.ComponentMixin} interface
         *
         * @param {apy.components.ComponentMixin} child
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var prepend = function prepend(child) {
            this.$components.unshift(child);
            return this;
        };

        /**
         *
         * @returns {Number}
         * @memberOf apy.components.ComponentMixin
         */
        var count = function count() {
            return this.$components.length;
        };

        /**
         *
         * @param child
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var remove = function remove(child) {
            var length = this.count();
            for (var i = 0; i < length; i++) {
                if (this.getChild(i) === child) {
                    this.$components.splice(i, 1);
                    break;
                }
            }
            return this;
        };

        /**
         *
         * @param i
         * @returns {*}
         * @memberOf apy.components.ComponentMixin
         */
        var getChild = function getChild(i) {
            return this.$components[i];
        };

        /**
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var hasChildren = function hasChildren() {
            return this.count() > 0;
        };

        /**
         *
         * @returns {Array}
         * @memberOf apy.components.ComponentMixin
         */
        var cleanedData = function cleanedData() {
            var cleaned = [];
            this.$components.filter(function (comp) {
                return comp.hasUpdated();
            }).forEach(function (comp) {
                cleaned.push(comp.cleanedData());
            });
            return cleaned;
        };

        /**
         *
         * @returns {Object}
         * @memberOf apy.components.ComponentMixin
         */
        var createTypesFactory = function createTypesFactory() {
            var self = this;
            var $TYPES = $apy.helpers.$TYPES;
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
                return new $apy.helpers.MediaFile(self.$endpoint);
            };
            $typesFactory[$TYPES.FLOAT] = function () {
                return 0.0;
            };
            $typesFactory[$TYPES.NUMBER] = function () {
                return 0;
            };
            $typesFactory[$TYPES.STRING] = function () {
                return '';
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
        };

        /**
         *
         * @returns {Array}
         * @memberOf apy.components.ComponentMixin
         */
        var createTypesForPolyField = function createTypesForPolyField () {
            var $typesForPoly = [];
            var $TYPES = $apy.helpers.$TYPES;
            Object.keys($TYPES).forEach(function (k) {
                var type = $TYPES[k];
                if([$TYPES.COLLECTION, $TYPES.RESOURCE, $TYPES.POLY, $TYPES.INTEGER, $TYPES.FLOAT].indexOf(type) === -1) {
                    $typesForPoly.push(type);
                }
            });
            $typesForPoly.sort();
            return $typesForPoly;
        };

        /**
         *
         * @param service
         * @param name
         * @param schema
         * @param value
         * @param $states
         * @param $endpoint
         * @param type
         * @param relationName
         * @param components
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var initialize = function initialize(service, name, schema, value, $states, $endpoint, type, relationName, components) {
            var $TYPES = $apy.helpers.$TYPES;
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
            this.$typesForPoly = createTypesForPolyField();
            this.$contentUrl = 'field-' + type + '.html';
            this.$name = name;
            this.$type = type;
            this.$states = $states;
            this.$endpoint = $endpoint;
            this.$relationName = relationName;
            this.setOptions(schema)
                .setValue(value);

            this.$Class = $apy.components.ComponentMixin;
            return this;
        };

        /**
         *
         * @param schema
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setOptions = function setOptions(schema) {
            this.$schema = schema;
            this.$request = (this.$schema && this.$schema.$hasMedia) ? this.$upload.upload : this.$http;
            return this;
        };

        /**
         *
         * @param value
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setValue = function setValue(value) {
            this.$value = value;
            return this;
        };

        /**
         * @memberOf apy.components.ComponentMixin
         */
        var validate = function validate() {
            var errors = [];
            this.$components.forEach(function (component) {
                try {
                    component.validate();
                } catch (error) {
                    errors.push(error);
                }
            });
            if(errors.length) {
                throw new $apy.Error('Validation Error: ' + errors.join(', '));
            }
        };

        /**
         *
         * @param char
         * @param field
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var shallContinue = function shallContinue (field, char) {
            char = char || '_';
            return field.startsWith && field.startsWith(char);
        };

        /**
         *
         * @param parent
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setParent = function setParent (parent) {
            this.$parent = parent;
            return this;
        };

        /* istanbul ignore next */
        /**
         *
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var load = function load () {
            return this;
        };

        /**
         *
         * @param parent
         * @param value
         * @returns {*}
         * @memberOf apy.components.ComponentMixin
         */
        var clone = function clone(parent, value) {
            if(!this.$Class) {
                throw new $apy.Error('No $Class property set !');
            }
            var instance = new this.$Class(this.$service,
                this.$name, this.$schema, value, this.$states,
                this.$endpoint, this.$type, this.$relationName);
            instance.setParent(parent || this.$parent);
            return instance;
        };

        /**
         *
         * @returns {*}
         * @memberOf apy.components.ComponentMixin
         */
        var cloneChild = function cloneChild() {
            var clone = null;
            var self = this;
            var fieldClassByType = $apy.helpers.fieldClassByType;
            function iterOverSchema(schema, name) {
                var cl;
                var relationName;
                switch (schema.type) {
                case $apy.helpers.$TYPES.OBJECTID:
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
        };

        /**
         *
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var oneMore = function oneMore() {
            var comp = this.cloneChild();
            if(comp) {
                this.add(comp);
            }
            return this;
        };

        /**
         *
         * @param schema
         * @param value
         * @param name
         * @param parent
         * @returns {*}
         * @memberOf apy.components.ComponentMixin
         */
        var createPolyField = function createPolyField (schema, value, name, parent) {
            var field = new $apy.components.fields.Poly(this.$service, name || this.$name, schema, value,
                this.$states, this.$endpoint, this.$type, this.$relationName);
            field.setParent(parent || this);
            return field;
        };

        /**
         *
         * @param value
         * @returns {*}
         * @memberOf apy.components.ComponentMixin
         */
        var cloneValue = function cloneValue(value) {
            return value;
        };

        /**
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var hasUpdated = function hasUpdated() {
            return this.$value !== this.$memo;
        };

        /**
         * @memberOf apy.components.ComponentMixin
         */
        var reset = function reset() {
            if (this.hasUpdated()) {
                this.$value = this.cloneValue(this.$memo);
            }
        };

        /**
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var isReadOnly = function isReadOnly() {
            var readOnly = 0;
            this.$components.forEach(function (comp) {
                if(comp.readOnly ||
                    (comp.hasOwnProperty('isReadOnly') && comp.isReadOnly())) {
                    readOnly++;
                }
            });
            return this.$components.length === readOnly;
        };

        /**
         *
         * @returns {*}
         * @memberOf apy.components.ComponentMixin
         */
        var data = function data() {
            return this.$originalValue;
        };

        /**
         * Set Component's inner StateHolder instance to the given state
         *
         * @param {string} state The state, must be one of the STATES list
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setState = function setState (state) {
            this.$states.set(state);
            return this;
        };

        /**
         * Factory method to get a StateHolder instance
         *
         * @param {Array} states A list of known states
         * @param {string} initialState The initial state (must be one of the `states` list).
         * @memberOf apy.components.ComponentMixin
         */
        var createStateHolder = function createStateHolder (initialState, states) {
            return new $apy.helpers.StateHolder(initialState || STATES.READ, states || STATES);
        };

        /**
         * Factorize logic
         * Return whether or not the Resource's
         * current state is in the passed state
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var isState = function isState(state) {
            return this.$states.$current === state;
        };

        /**
         * Indicate when the Resource inner state is equal to CREATE
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var inCreateState = function inCreateState() {
            return this.isState(STATES.CREATE);
        };

        /**
         * Indicate when the Resource inner state is equal to READ
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var inReadState = function inReadState() {
            return this.isState(STATES.READ);
        };

        /**
         * Indicate when the Resource inner state is equal to UPDATE
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var inUpdateState = function inUpdateState() {
            return this.isState(STATES.UPDATE);
        };

        /**
         * Indicate when the Resource inner state is equal to DELETE
         *
         * @returns {boolean}
         * @memberOf apy.components.ComponentMixin
         */
        var inDeleteState = function inDeleteState() {
            return this.isState(STATES.DELETE);
        };

        /**
         * Set the Resource inner state to CREATE
         *
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setCreateState = function setCreateState () {
            this.setState(STATES.CREATE);
            return this;
        };

        /**
         * Set the Resource inner state to READ
         *
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setReadState = function setReadState () {
            this.setState(STATES.READ);
            return this;
        };

        /**
         * Set the Resource inner state to UPDATE
         *
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setUpdateState = function setUpdateState () {
            this.setState(STATES.UPDATE);
            return this;
        };

        /**
         * Set the Resource inner state to DELETE
         *
         * @returns {this}
         * @memberOf apy.components.ComponentMixin
         */
        var setDeleteState = function setDeleteState () {
            this.setState(STATES.DELETE);
            return this;
        };

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
            this.isFunction = $apy.helpers.isFunction;
            this.createStateHolder = createStateHolder;
            return this;
        };
    })();

})( apy );
