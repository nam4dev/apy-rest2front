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
(function($apy) {
    /**
     *  RequestMixin offer a common interface to access
     *  low-level network resources
     *
     * @mixin apy.components.RequestMixin
     */
    $apy.components.RequestMixin = (function RequestMixin() {
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
                        new $apy.errors.EveHTTPError(error)
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
     * @mixin apy.components.CompositeMixin
     */
    $apy.components.CompositeMixin = (function CompositeMixin() {
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
                case $apy.helpers.$TYPES.LIST:
                    fieldObj = new $apy.components.fields.List(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case $apy.helpers.$TYPES.DICT:
                    fieldObj = new $apy.components.fields.Nested(this.$service, name, schema.schema, value, this.$states, null, $apy.helpers.$TYPES.RESOURCE);
                    // if(!schema.schema) {
                    //    fieldObj.add(fieldObj.createPolyField(undefined, value, name));
                    // }
                    break;
                case $apy.helpers.$TYPES.POINT:
                    fieldObj = new $apy.components.fields.geo.Point(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case $apy.helpers.$TYPES.MEDIA:
                    fieldObj = new $apy.components.fields.Media(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case $apy.helpers.$TYPES.FLOAT:
                case $apy.helpers.$TYPES.NUMBER:
                case $apy.helpers.$TYPES.INTEGER:
                    fieldObj = new $apy.components.fields.Number(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case $apy.helpers.$TYPES.STRING:
                    fieldObj = new $apy.components.fields.String(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case $apy.helpers.$TYPES.BOOLEAN:
                    fieldObj = new $apy.components.fields.Boolean(this.$service, name, schema, value, this.$states, endpoint);
                    break;

                case $apy.helpers.$TYPES.DATETIME:
                    fieldObj = new $apy.components.fields.Datetime(this.$service, name, schema, value, this.$states, endpoint);
                    break;
                case $apy.helpers.$TYPES.OBJECTID:
                    var relationName = schema.data_relation.resource;
                    var schemaObject = this.$service.$schemas[relationName];
                    fieldObj = new $apy.components.fields.Embedded(this.$service, name, schemaObject, value,
                        this.$states, endpoint, $apy.helpers.$TYPES.OBJECTID, relationName);
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
                $apy.helpers.$TYPES.BOOLEAN,
                $apy.helpers.$TYPES.DATETIME
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
})(apy);
