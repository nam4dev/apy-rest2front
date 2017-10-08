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
     * @memberOf apy.components.ComponentMixin
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
    /**
     *  RequestMixin offer a common interface to access
     *  low-level network resources
     *
     * @mixin RequestMixin
     * @memberOf apy.components.RequestMixin
     */
    apy.components.RequestMixin = (function RequestMixin() {
        // Registering mixin globally

        /**
         * Set `Authorization` HTTP Header (if available)
         *
         * @memberOf apy.components.RequestMixin
         *
         * @param {Object} headers (optional) HTTP Headers
         *
         * @return {Object} HTTP Headers with `Authorization` (if available)
         */
        function $authHeaders(headers) {
            var service = this.$service || this;
            headers = headers || {
                'Content-Type': 'application/json'
            };
            // FIXME Shall be accessed from apy.settings[_Settings] instance
            if (service && service.$tokenInfo && service.$tokenInfo.access_token) {
                var authToken = '';
                var type = service.$tokenInfo.token_type;
                authToken += (type ? type : 'Bearer') + ' ' + service.$tokenInfo.access_token;
                headers['Authorization'] = authToken;
            }
            return headers;
        }

        /**
         * Method to manage HTTP requests
         *
         * Authentication management (Authorization & Bearer)
         *
         * @memberOf apy.components.RequestMixin
         *
         * @param {Object} request The Request object
         *
         * @return {Promise} Asynchronous call
         */
        function $access(request) {
            if(!this.$request) {
                this.$request = $.ajax;
            }
            request = request || {};
            request.headers = this.$authHeaders(request.headers);
            return this.$request(request);
        }

        /**
         * Common Method for components which need to request on network
         *
         * @memberOf apy.components.RequestMixin
         *
         * @param {Object} options The Request object
         *
         * @return {Promise} Asynchronous call
         */
        function request(options) {
            var self = this;
            return new Promise(function(resolve, reject) {
                function on_success(data) {
                    return resolve(data);
                }
                function on_failure(error) {
                    return reject(
                        new apy.errors.EveHTTPError(error)
                    );
                }
                function on_resource_progress(evt) {
                    var fileName;
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    try {
                        fileName = evt.config.data.file.name;
                    }
                    catch (e) {
                        console.log('Error while retrieving filename: ' + e);
                    }
                    console.log('progress: ' + progressPercentage + '% ' + fileName, evt);
                }
                self.$access(options)
                    .then(on_success, on_failure, on_resource_progress);
            });
        }

        /**
         *
         * @param request
         */
        function setConfig(request) {
            request.url += '/' + this[this.$template.id];
            request.headers['If-Match'] = this[this.$template.etag];
        }

        function setRequest(request) {
            var payload = this.cleanedData();
            if(payload) {
                var formData = new FormData();
                Object.keys(payload).forEach(function (key) {
                    if(payload[key] instanceof File) {
                        formData.append(key, payload.pop(key));
                    }
                    if(Array.isArray(payload[key]) && payload[key][0] instanceof File) {
                        var files = payload[key];
                        (files || []).forEach(function (f) {
                            formData.append(key, f);
                        });
                        delete payload[key];
                    }
                    else {
                        formData.append(key, JSON.stringify(payload[key]));
                    }
                });
                request.data = formData;
                request.processData = false;
                request.contentType = false;
            }
        }

        /**
         * Common Method for components which need to request on network
         *
         * @memberOf apy.components.RequestMixin
         *
         * @param {string} uri The URI to contact
         * @param {string} method The HTTP method Verb (GET, POST, PATCH, ...)
         *
         * @return {Promise} Asynchronous call
         */
        function createRequest(uri, method) {
            if (method === 'PATCH' && !this[this.$template.id]) {
                method = 'POST';
            }
            method = method || 'POST';
            var request = {
                url: uri,
                method: method,
                headers: {}
            };
            switch (method) {
                case 'POST':
                    this.setRequest(request);
                    break;
                case 'PATCH':
                    this.setConfig(request);
                    this.setRequest(request);
                    break;
                case 'DELETE':
                    this.setConfig(request);
                    break;
                default :
                    break;
            }
            return this.request(request)
        }

        return function() {
            this.$access = $access;
            this.request = request;
            this.setConfig = setConfig;
            this.setRequest = setRequest;
            this.$authHeaders = $authHeaders;
            this.createRequest = createRequest;
            return this;
        };
    })();

    /**
     * CompositeMixin offer a common interface to manipulate `recursive` data.
     *
     * @mixin CompositeMixin
     * @memberOf apy.components.CompositeMixin
     */
    apy.components.CompositeMixin = (function CompositeMixin() {
// Registering mixin globally

        /**
         * Common Method for composite container components (Resource, List)
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @param {string} type The Component type
         * @param {string} name The Component name
         * @param {Object} schema The Component (data-)schema
         * @param {*} value (optional) The component value
         * @param {string} endpoint The Application global endpoint
         * @param {boolean} append If true, the created component instance is appended to `this`
         *
         * @return {*} A component instance
         */
        function createField(type, name, schema, value, endpoint, append) {
            var fieldObj;
            // true by default if not specifically set to false
            schema = schema || {};
            append = append === false ? append : true;
            endpoint = endpoint || this.$endpoint;
            switch (type) {
                case apy.helpers.$TYPES.LIST:
                    fieldObj = new apy.components.fields.List(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case apy.helpers.$TYPES.DICT:
                    fieldObj = new apy.components.fields.Nested(this.$service, name, schema.schema, value, this.$states, null, apy.helpers.$TYPES.RESOURCE);
                    // if(!schema.schema) {
                    //    fieldObj.add(fieldObj.createPolyField(undefined, value, name));
                    // }
                    break;
                case apy.helpers.$TYPES.POINT:
                    fieldObj = new apy.components.fields.geo.Point(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case apy.helpers.$TYPES.MEDIA:
                    fieldObj = new apy.components.fields.Media(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case apy.helpers.$TYPES.FLOAT:
                case apy.helpers.$TYPES.NUMBER:
                case apy.helpers.$TYPES.INTEGER:
                    fieldObj = new apy.components.fields.Number(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case apy.helpers.$TYPES.STRING:
                    fieldObj = new apy.components.fields.String(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case apy.helpers.$TYPES.BOOLEAN:
                    fieldObj = new apy.components.fields.Boolean(this.$service, name, schema, value, this.$states, endpoint);
                    break;

                case apy.helpers.$TYPES.DATETIME:
                    fieldObj = new apy.components.fields.Datetime(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case apy.helpers.$TYPES.OBJECTID:
                    var relationName = schema.data_relation.resource;
                    var schemaObject = this.$service.$schemas[relationName];
                    fieldObj = new apy.components.fields.Embedded(this.$service, name, schemaObject, value,
                        this.$states, endpoint, apy.helpers.$TYPES.OBJECTID, relationName);
                    break;
                default:
                    fieldObj = this.createPolyField(schema, value, name);
                    // FIXME: known to be used for Resource, Embedded Field, check no side-effect on List Field
                    fieldObj.readOnly = true;
                    break;
            }
            fieldObj.setParent(this);
            if (append) {
                this.add(fieldObj);
            }
            return fieldObj;
        }

        /**
         * `template method`
         * Groups Composite (recursive) logic.
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @param {Object} resource (optional) A Resource object
         *
         * @return {apy.components.CompositeMixin} `this`
         */
        function _load(resource) {
            for (var field in this.$schema) {
                if (!this.$schema.hasOwnProperty(field) ||
                    this.continue(field) ||
                    this.continue(field, '$')) {
                    continue;
                }
                var schema = this.$schema[field];
                try {
                    var type = schema.type;
                }
                catch (e) {
                    continue;
                }
                var endpoint = this.$endpointBase;
                var value = resource[field] || this.$service.$instance.schema2data(schema, field);
                this.$$createField(type, field, schema, value, endpoint, true);
            }
            return this;
        }

        /**
         * Exposed (public) `template method`
         *
         * Groups Composite (recursive) logic.
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @param {Object} resource (optional) A Resource object
         *
         * @return {apy.components.CompositeMixin} `this`
         */
        function load(resource) {
            var self = this;
            resource = resource || {};
            var resourceObj = {};
            Object.keys(Object.assign(resource)).forEach(function(k) {
                if (self.continue(k)) {
                    self[k] = resource[k];
                }
                else {
                    resourceObj[k] = resource[k];
                }
            });
            this._load(resourceObj);
            this.$components.sort(function(one, two) {
                if (one.$name < two.$name) {
                    return 1;
                }
                if (one.$name > two.$name) {
                    return -1;
                }
                return 0;
            });
            return this;
        }

        /**
         * Common Method for components `reset` feature
         * Allow the component to restore its initial state
         * (based on its `$memo` attribute)
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @return {apy.components.CompositeMixin} `this`
         */
        function reset() {
            this.$components.forEach(function(comp) {
                comp.reset();
            });
            if (this.$selfUpdated) {
                this.$selfUpdated = false;
            }
            return this;
        }

        /**
         * Allow to evaluate whether or not an Object instance is empty.
         * Trick here is to use JS native mechanism to iterate over the object.
         * If it cannot iterate, the Object is empty, otherwise not.
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @param {Object} obj Object instance to be evaluated
         *
         * @return {boolean} Whether the Object is empty or not
         */
        function isEmpty(obj) {
            for (var key in obj) {
                return (false);
            }
            return (true);
        }

        /**
         * Common method which is charge to clean the component inner data.
         * All data-related inner components are collected into an Object instance.
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @return {Object} collected data-related inner components
         */
        function cleanedData() {
            var cleaned = {};
            this.$components.forEach(function(comp) {
                var data = comp.cleanedData();
                if (data || data === false || data === 0) {
                    cleaned[comp.$name] = data;
                }
            });
            if (isEmpty(cleaned)) {
                cleaned = undefined;
            }
            return cleaned;
        }

        /**
         * Common method which tells whether the component state is UPDATED or not
         * In other words, whether one of its inner component is UPDATED or not
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @return {boolean} true if UPDATED state
         */
        function hasUpdated() {
            if (this.$selfUpdated) {
                return true;
            }
            var updated = false;
            this.$components.forEach(function(comp) {
                if (comp.hasUpdated()) {
                    updated = true;
                }
            });
            return updated;
        }

        /**
         * Common method to definitely set the updated components' values,
         * after a successful Request to the backend has been acknowledged.
         * `$memo` attribute is overridden by the current `$value`
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @return {apy.components.CompositeMixin} `this`
         */
        function selfCommit() {
            this.$components.forEach(function(comp) {
                comp && comp.selfCommit && comp.selfCommit();
                if (comp.$selfUpdated) {
                    comp.$selfUpdated = false;
                }
            });
            if (this.$selfUpdated) {
                this.$selfUpdated = false;
            }
            return this;
        }

        /**
         * Common Method to allow one component to update itself.
         *
         * @memberOf apy.components.CompositeMixin
         *
         * @param {Object} update The update payload
         * @param {boolean} commit If true, `selfCommit` method is invoked
         *
         * @return {apy.components.CompositeMixin} `this`
         */
        function selfUpdate(update, commit) {
            var self = this;
            update = update || {};
            commit = commit || false;
            // Copy private properties such as _id, _etag, ...
            Object.keys(update).forEach(function(name) {
                if (self.continue(name)) {
                    self[name] = update[name];
                }
            });
            // Copy $value in case of embedded resource
            if (update.hasOwnProperty('$value')) {
                this.$value = update.$value;
            }
            // Copy data
            if (update.hasOwnProperty('$components')) {
                self.$components.forEach(function(comp, index) {
                    if (update.$components[index]) {
                        comp.selfUpdate(update.$components[index], commit);
                    }
                });
            }
            // Commit => save the inner state ($value, $memo)
            // of each component recursively
            this.$selfUpdated = !commit;
            if (commit) {
                this.selfCommit();
            }
            return this;
        }

        /**
         * Composite Component String representation
         *
         * @override
         * @memberOf apy.components.CompositeMixin
         *
         * @return {string} Composite Component string representation
         */
        function toString() {

            if(this.$render) {
                return this.$render(this);
            }

            var values = [];
            var excludedTypes = [
                apy.helpers.$TYPES.BOOLEAN,
                apy.helpers.$TYPES.DATETIME
            ];

            var filtered = this.$components.filter(function(c) {
                return c.$required && excludedTypes.indexOf(c.$type) === -1;
            });

            if (!filtered.length) {
                filtered = this.$components.filter(function(c) {
                    return excludedTypes.indexOf(c.$type) === -1;
                });
            }

            filtered.forEach(function(c) {
                var str = c.toString();
                if(str) values.push(str);
            });

            if (values.length) {
                return values.join(', ');
            }
            return '';
        }

        return function() {
            this.load = load;
            this._load = _load;
            this.reset = reset;
            this.toString = toString;
            this.hasUpdated = hasUpdated;
            this.selfUpdate = selfUpdate;
            this.selfCommit = selfCommit;
            this.cleanedData = cleanedData;
            this.$$createField = createField;
            return this;
        };
    })();
})();
