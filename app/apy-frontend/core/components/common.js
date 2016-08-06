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
 *  Common snippets of code (Mixins, ...)
 *
 *  """
 */

(function ($window) {

    // Registering mixin globally
    $window.ApyRequestMixin = (function () {

        function $authHeaders(headers) {
            var service = this.$service || this;
            headers = headers || {
                    'Content-Type': 'application/json'
                };
            if(service && service.$tokenInfo && service.$tokenInfo.access_token) {
                var authToken = '';
                var type = service.$tokenInfo.token_type;
                authToken += (type ? type : 'Bearer') + ' ' + service.$tokenInfo.access_token;
                headers['Authorization'] = authToken;
            }
            return headers;
        }

        function $access(request) {
            if(!this.$request) {
                this.$request = (this.$schema && this.$schema.$hasMedia) ?
                    this.$upload.upload : this.$http;
            }
            request = request || {};
            request.headers = this.$authHeaders(request.headers);
            return this.$request(request);
        }

        /**
         * Common Method for components which need to request on network
         *
         * @param uri: The URI to contact
         * @param method: The HTTP method Verb (GET, POST, PATCH, ...)
         *
         * @returns {Promise} Asynchronous
         */
        function createRequest (uri, method) {
            var self = this;
            var setConfig = function () {
                request.url += '/' + self._id;
                request.headers['If-Match'] = self._etag;
            };
            if(method === 'PATCH' && !self._id) {
                method = 'POST'
            }
            method = method || 'POST';
            var request = {
                url: uri,
                method: method,
                headers: {}
            };
            switch (method) {
                case 'POST':
                    request.data = this.cleanedData();
                    break;
                case 'PATCH':
                    setConfig();
                    request.data = this.cleanedData();
                    break;
                case 'DELETE':
                    setConfig();
                    break;
                default :
                    break;
            }
            return new Promise(function (resolve, reject) {
                return self.$access(request).then(resolve, function (error) {
                        return reject(new ApyEveHTTPError(error))
                    });
            });
        }

        return function () {
            this.$access = $access;
            this.$authHeaders = $authHeaders;
            this.createRequest = createRequest;
            return this;
        }
    })();

    // Registering mixin globally
    $window.ApyCompositeMixin =  (function () {

        /**
         * Common Method for composite container components (Resource, List)
         *
         * @param type: The Component type
         * @param name: The Component name
         * @param schema: The Component (data-)schema
         * @param value: (optional) The component value
         * @param endpoint: The Application global endpoint
         * @param append: If true, the created component instance is appended to `this`
         *
         * @returns {*} A component instance
         */
        function createField (type, name, schema, value, endpoint, append) {
            var fieldObj;
            // true by default if not specifically set to false
            append = append === false ? append : true;
            endpoint = endpoint || this.$endpoint;
            switch(type) {
                case this.$types.LIST:
                    fieldObj = new ApyListField(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case this.$types.DICT:
                    fieldObj = new ApyNestedField(this.$service, name, schema.schema, value, this.$states, null, this.$types.RESOURCE);
                    if(!schema.schema) {
                        fieldObj.add(fieldObj.createPolyField(undefined, value, name));
                    }
                    break;
                case $TYPES.POINT:
                    fieldObj = new ApyPointField(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case this.$types.MEDIA:
                    fieldObj = new ApyMediaField(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case this.$types.FLOAT:
                case this.$types.NUMBER:
                case this.$types.INTEGER:
                    fieldObj = new ApyNumberField(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case this.$types.STRING:
                    fieldObj = new ApyStringField(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case this.$types.BOOLEAN:
                    fieldObj = new ApyBooleanField(this.$service, name, schema, value, this.$states, endpoint);
                    break;

                case this.$types.DATETIME:
                    fieldObj = new ApyDatetimeField(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case this.$types.OBJECTID:
                    var relationName = schema.data_relation.resource;
                    var schemaObject = this.$service.$schemas[relationName];
                    fieldObj = new ApyEmbeddedField(this.$service, name, schemaObject, value,
                        this.$states, endpoint, this.$types.OBJECTID, relationName);
                    break;
                default:
                    fieldObj = this.createPolyField(undefined, value, name);
                    // FIXME: known to be used for Resource, Embedded Field, check no side-effect on List Field
                    fieldObj.readOnly = true;
                    break;
            }
            fieldObj.setParent(this);
            if(append) {
                this.add(fieldObj);
            }
            return fieldObj;
        }

        /**
         * Private `template method`
         * Groups Composite (recursive) logic.
         *
         * @param resource: (optional) A Resource Object ({})
         */
        function _load (resource) {
            for (var field in this.$schema) {
                if(!this.$schema.hasOwnProperty(field) ||
                    this.continue(field) ||
                    this.continue(field, '$')) {
                    continue;
                }
                var schema = this.$schema[field];
                try {
                    var type = schema.type;
                }
                catch(e) {
                    continue;
                }
                var endpoint = this.$endpointBase;
                var value = resource[field] || this.$service.$instance.schema2data(schema, field);
                this.$$createField(type, field, schema, value, endpoint, true);
            }
            this.loadValue();
            return this;
        }

        /**
         * Exposed (public) `template method`
         *
         * Groups Composite (recursive) logic.
         *
         * @param resource: (optional) A Resource Object ({})
         * @returns {this}
         */
        function load (resource) {
            var self = this;
            resource = resource || {};
            var resourceObj = {};
            Object.keys(Object.assign(resource)).forEach(function (k) {
                if(self.continue(k)) {
                    self[k] = resource[k];
                }
                else {
                    resourceObj[k] = resource[k];
                }
            });
            this._load(resourceObj);
            this.$components.sort(function (one, two) {
                if ( one.$name < two.$name ) {
                    return 1;
                }
                if ( one.$name > two.$name ) {
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
         * @returns {this}
         */
        function reset () {
            this.$components.forEach(function (comp) {
                comp && comp.reset && comp.reset();
            });
            if(this.$selfUpdated) {
                this.$selfUpdated = false;
            }
            this.loadValue();
            return this;
        }

        /**
         * Allow to evaluate whether or not an Object instance is empty.
         * Trick here is to use JS native mechanism to iterate over the object.
         * If it cannot iterate, the Object is empty, otherwise not.
         *
         * @param obj: Object instance to be evaluated
         * @returns {boolean} Whether the Object is empty or not
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
         * @returns {Object} collected data-related inner components
         */
        function cleanedData () {
            var cleaned = {};
            this.$components.forEach(function (comp) {
                var data = comp.cleanedData();
                if(data || data === false || data === 0) {
                    cleaned[comp.$name] = data;
                }
            });
            if(isEmpty(cleaned)) {
                cleaned = undefined;
            }
            return cleaned;
        }

        /**
         * Common method which tells whether the component state is UPDATED or not
         * In other words, whether one of its inner component is UPDATED or not
         *
         * @returns {boolean} true if UPDATED state
         */
        function hasUpdated () {
            if(this.$selfUpdated) {
                return true;
            }
            var updated = false;
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated()) {
                    updated = true;
                }
            });
            return updated;
        }

        /**
         * Common method to definitely set the updated components' values,
         * after a successful Request to the backend has been acknowledged.
         * `$memo` attribute is overridden by the current `$value`.hasUpdated
         *
         * @returns {this}
         */
        function selfCommit () {
            this.$components.forEach(function (comp) {
                comp && comp.selfCommit && comp.selfCommit();
                if(comp.$selfUpdated) {
                    comp.$selfUpdated = false;
                }
            });
            return this;
        }

        /**
         * Common Method to allow one component to update itself.
         *
         * @param update: The update payload (Object)
         * @param commit: If true, `selfCommit` method is invoked
         * @returns {this}
         */
        function selfUpdate (update, commit) {
            var self = this;
            update = update || {};
            commit = commit || false;
            // Copy private properties such as _id, _etag, ...
            forEach(update, function (value, name) {
                if(self.continue(name)) {
                    self[name] = value
                }
            });
            // Copy $value in case of embedded resource
            if(update.hasOwnProperty('$value')) {
                this.$value = update.$value;
            }
            // Copy data
            if(update.hasOwnProperty('$components')) {
                self.$components.forEach(function (comp, index) {
                    if(update.$components[index]) {
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

        return function () {
            this.load = load;
            this._load = _load;
            this.reset = reset;
            this.hasUpdated = hasUpdated;
            this.selfUpdate = selfUpdate;
            this.selfCommit = selfCommit;
            this.cleanedData = cleanedData;
            this.$$createField = createField;
            return this;
        }

    })();

})(window);
