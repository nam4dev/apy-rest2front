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

(function() {
    /**
     * Base Component Interface.
     * Apy Composite base component abstraction (field, resource, collection)
     *
     * Define a set of common methods.
     * It relies on `composite` design pattern.
     *
     * @mixin ComponentMixin
     * @memberOf apy.components
     */
    apy.components.ComponentMixin = (function ComponentMixin() {
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
         * Base Component String representation
         *
         * @override
         * @memberOf apy.components.ComponentMixin
         *
         * @return {string} Component base string representation
         */
        function toString() {
            if(this.$render) {
                return this.$render(this);
            }
            return '' + this.$value;
        }

        /**
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {apy.components.ComponentMixin} child child component
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function add(child) {
            this.$components.push(child);
            return this;
        }

        /**
         * Prepend to `components`,
         * any child implementing {apy.components.ComponentMixin} interface
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {apy.components.ComponentMixin} child child component
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function prepend(child) {
            this.$components.unshift(child);
            return this;
        }

        /**
         * Count of inner component (children)
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {Number} children's count
         */
        function count() {
            return this.$components.length;
        }

        /**
         * Remove given child
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {apy.components.ComponentMixin} child child component
         *
         * @return {apy.components.ComponentMixin} `this`
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
         * Get a child component
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {Number} index Component index
         *
         * @return {apy.components.ComponentMixin} Child
         */
        function getChild(index) {
            return this.$components[index];
        }

        /**
         * Root component's has children?
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean} Is children's count > 0
         */
        function hasChildren() {
            return this.count() > 0;
        }

        /**
         * Logic base to get cleaned data from component
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {Array} A list of cleaned component data
         */
        var cleanedData = function cleanedData() {
            var cleaned = [];
            this.$components.filter(function(comp) {
                return comp.hasUpdated();
            }).forEach(function(comp) {
                cleaned.push(comp.cleanedData());
            });
            return cleaned;
        };

        /**
         * Create a registry of default value functions of known types
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {Object} A registry of default value functions of known types
         */
        function createTypesFactory() {
            var self = this;
            var $TYPES = apy.helpers.$TYPES;
            var $typesFactory = {};
            $typesFactory[$TYPES.LIST] = function() {
                return [];
            };
            $typesFactory[$TYPES.DICT] = function() {
                return {};
            };
            $typesFactory[$TYPES.POLY] = function() {
                return undefined;
            };
            $typesFactory[$TYPES.MEDIA] = function() {
                return new apy.helpers.MediaFile(self.$endpoint);
            };
            $typesFactory[$TYPES.FLOAT] = function() {
                return 0.0;
            };
            $typesFactory[$TYPES.NUMBER] = function() {
                return 0;
            };
            $typesFactory[$TYPES.STRING] = function() {
                return '';
            };
            $typesFactory[$TYPES.BOOLEAN] = function() {
                return false;
            };
            $typesFactory[$TYPES.INTEGER] = function() {
                return 0;
            };
            $typesFactory[$TYPES.OBJECTID] = function() {
                return null;
            };
            $typesFactory[$TYPES.DATETIME] = function() {
                return new Date();
            };
            $typesFactory[$TYPES.RESOURCE] = function() {
                return null;
            };
            return $typesFactory;
        }

        /**
         * Create a list of types to which `apy.components.fields.Poly` may switch
         * It is used for Component having unknown schema definition.
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {Array} A list of types
         */
        function createTypesForPolyField() {
            var $typesForPoly = [];
            var $TYPES = apy.helpers.$TYPES;
            Object.keys($TYPES).forEach(function(k) {
                var type = $TYPES[k];
                if ([$TYPES.COLLECTION, $TYPES.RESOURCE, $TYPES.POLY, $TYPES.INTEGER, $TYPES.FLOAT].indexOf(type) === -1) {
                    $typesForPoly.push(type);
                }
            });
            $typesForPoly.sort();
            return $typesForPoly;
        }

        /**
         * Common constructor-like `initialize` method
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {apy.CompositeService} service Service instance
         * @param {string} name Component name
         * @param {string} type Component type
         * @param {Object} schema Component schema
         * @param {Object} value Component value
         * @param {apy.helpers.StateHolder} $states Component inner state holder instance
         * @param {Array} components Component initial components
         * @param {string} endpoint Component endpoint
         * @param {string} relationName (optional) Component relation name
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function initialize(service, name, schema, value, $states, endpoint, type, relationName, components) {
            var $TYPES = apy.helpers.$TYPES;
            this.$originalValue = this.cloneValue(value);
            this.$types = $TYPES;
            this.$service = service;
            this.$typesFactory = createTypesFactory();
            // components index
            this.$components = components || [];
            this.$components = Array.isArray(this.$components) ? this.$components : [this.$components];
            this.$typesForPoly = createTypesForPolyField();
            this.$contentUrl = 'field-' + type + '.html';
            this.$name = name;
            this.$type = type;
            this.$states = $states;
            this.$endpoint = endpoint;
            this.$relationName = relationName;
            this.setOptions(schema)
                .setValue(value);

            this.$Class = apy.components.ComponentMixin;
            return this;
        }

        /**
         * Component' schemas object setter
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {Object} schema Component schema
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setOptions(schema) {
            this.$schema = schema;
            this.$render = schema.$render;
            this.$displayed = schema.$displayed;
            if([true, false].indexOf(this.$displayed) === -1) {
                this.$displayed = true;
            }
            return this;
        }

        /**
         * Component's value setter
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {Object} value Component value
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setValue(value) {
            this.$value = value;
            return this;
        }

        /**
         * Validate each component
         * if error, all errors are collected before being
         * thrown.
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @throws apy.errors.Error when validation fails
         */
        function validate() {
            var errors = [];
            this.$components.forEach(function(component) {
                try {
                    component.validate();
                } catch (error) {
                    errors.push(error);
                }
            });
            if (errors.length) {
                throw new apy.errors.Error('Validation Error: ' + errors.join(', '));
            }
        }

        /**
         * When a Component payload is received from the backend
         * it may contain some extra metadata fields
         * In Eve, those fields are prefixed with `_`
         *
         * Those properties are considered private to the Component
         *
         * To be used in `forEach` loop as `continue`
         *
         * @alias continue
         * @memberOf apy.components.ComponentMixin
         *
         * @example
         * var payload = {
         *     _id: '...',
         *     _etag: '...',
         *     _updated: '...',
         *     title: "A nice title",
         *     description: "Another nice description"
         * }
         *
         * var myComponent = ...
         * Object.keys(payload).forEach(function(key){
         *     if(myComponent.continue(key, '_')) {
         *         myComponent[key] = payload[key];
         *     }
         * });
         *
         * @param {string} char Object's property prefix ($, _)
         * @param {string} field field's name
         *
         * @return {boolean}
         */
        function shallContinue(field, char) {
            char = char || '_';
            return field.startsWith && field.startsWith(char);
        }

        /**
         * Component's parent setter
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {apy.components.ComponentMixin} parent (optional) A parent component.
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setParent(parent) {
            this.$parent = parent;
            return this;
        }

        /* istanbul ignore next */
        /**
         * Common method interface
         * To be overridden in subclasses
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function load() {
            return this;
        }

        /**
         * Clone component itself
         * Note: cloning is always deep cloning
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {apy.components.ComponentMixin} parent
         * (optional) different logical parent component (default is `this.$parent`)
         * @param {*} value any matching value (according to type)
         *
         * @return {apy.components.ComponentMixin} Cloned component
         */
        function clone(parent, value) {
            if (!this.$Class) {
                throw new apy.errors.Error('No $Class property set !');
            }
            var instance = new this.$Class(this.$service,
                this.$name, this.$schema, value, this.$states,
                this.$endpoint, this.$type, this.$relationName);
            instance.setParent(parent || this.$parent);
            return instance;
        }

        /**
         * Clone a child component
         * Note: cloning is always deep cloning
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {*} Cloned child component
         */
        function cloneChild() {
            var clone = null;
            var self = this;
            var fieldClassByType = apy.helpers.fieldClassByType;
            function iterOverSchema(schema, name) {
                var cl;
                var relationName;
                switch (schema.type) {
                    case apy.helpers.$TYPES.OBJECTID:
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
                if (this.$schema && this.$schema.schema) {
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

        /**
         * Add one more child to the Component
         * Useful for `apy.components.Collection`
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function oneMore() {
            var comp = this.cloneChild();
            if (comp) {
                this.add(comp);
            }
            return this;
        }

        /**
         * Generalize Polymorph Field creation
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {Object} schema Field' schema
         * @param {Object} value Field's value
         * @param {string} name Field's name
         * @param {apy.components.ComponentMixin} parent (optional) Field's parent
         *
         * @return {apy.components.fields.Poly} A Polymorph Field instance
         */
        function createPolyField(schema, value, name, parent) {
            var field = new apy.components.fields.Poly(this.$service, name || this.$name, schema, value,
                this.$states, this.$endpoint, this.$type, this.$relationName);
            field.setParent(parent || this);
            return field;
        }

        /**
         * Base method interface to clone a value
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {*} value Any value matching its type
         *
         * @return {*} cloned value
         */
        function cloneValue(value) {
            return value;
        }

        /**
         * Return true if at least one inner Component is updated
         * In other words, if original value has changed from current one.
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean} Is the Component updated ?
         */
        function hasUpdated() {
            return this.$value !== this.$memo;
        }

        /**
         * Reset inner component value to its original value ($memo) if different
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function reset() {
            if (this.hasUpdated()) {
                this.$value = this.cloneValue(this.$memo);
            }
            return this;
        }

        /**
         * Is the component a `read-only` one ?
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean} true or false
         */
        function isReadOnly() {
            var readOnly = 0;
            this.$components.forEach(function(comp) {
                if (comp.readOnly ||
                    (comp.hasOwnProperty('isReadOnly') && comp.isReadOnly())) {
                    readOnly++;
                }
            });
            return this.$components.length === readOnly;
        }

        /**
         * Shortcut original value getter
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {*} Original value for the component (passed from constructor)
         */
        function data() {
            return this.$originalValue;
        }

        /**
         * Set Component's inner StateHolder instance to the given state
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {string} state The state, must be one of the STATES list
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setState(state) {
            this.$states.set(state);
            return this;
        }

        /**
         * Factory method to get a StateHolder instance
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @param {Array} states A list of known states
         * @param {string} initialState The initial state (must be one of the `states` list).
         *
         * @return {apy.helpers.StateHolder} A StateHolder instance
         */
        function createStateHolder(initialState, states) {
            return new apy.helpers.StateHolder(initialState || STATES.READ, states || STATES);
        }

        /**
         * Factorize logic
         * Return whether or not the Component's
         * current state is in the passed state
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean}
         */
        function isState(state) {
            return this.$states.$current === state;
        }

        /**
         * Indicate when the Component inner state is equal to CREATE
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean}
         */
        function inCreateState() {
            return this.isState(STATES.CREATE);
        }

        /**
         * Indicate when the Component inner state is equal to READ
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean}
         */
        function inReadState() {
            return this.isState(STATES.READ);
        }

        /**
         * Indicate when the Component inner state is equal to UPDATE
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean}
         */
        function inUpdateState() {
            return this.isState(STATES.UPDATE);
        }

        /**
         * Indicate when the Component inner state is equal to DELETE
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {boolean}
         */
        function inDeleteState() {
            return this.isState(STATES.DELETE);
        }

        /**
         * Set the Component inner state to CREATE
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setCreateState() {
            this.setState(STATES.CREATE);
            return this;
        }

        /**
         * Set the Component inner state to READ
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setReadState() {
            this.setState(STATES.READ);
            return this;
        }

        /**
         * Set the Component inner state to UPDATE
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setUpdateState() {
            this.setState(STATES.UPDATE);
            return this;
        }

        /**
         * Set the Component inner state to DELETE
         *
         * @memberOf apy.components.ComponentMixin
         *
         * @return {apy.components.ComponentMixin} `this`
         */
        function setDeleteState() {
            this.setState(STATES.DELETE);
            return this;
        }

        return function() {
            this.add = add;
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
            this.isFunction = apy.helpers.isFunction;
            this.createStateHolder = createStateHolder;
            return this;
        };
    })();
})();
