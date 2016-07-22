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

    $window.ApyRequestMixin = (function () {

        /**
         *
         * @param uri
         * @param method
         *
         * @returns {Promise}
         */
        function createRequest (uri, method) {
            if(!this.$request) {
                this.$request = (this.$schema && this.$schema.$hasMedia) ?
                    this.$upload.upload : this.$http;
            }
            var self = this;
            method = method || 'POST';
            return new Promise(function (resolve, reject) {
                var data = undefined;
                var headers = {
                    'Content-Type': 'application/json'
                };
                var setConfig = function () {
                    uri += '/' + self._id;
                    headers['If-Match'] = self._etag;
                };
                switch (method) {
                    case 'POST':
                        data = self.cleanedData();
                        break;
                    case 'PATCH':
                        setConfig();
                        data = self.cleanedData();
                        break;
                    case 'DELETE':
                        setConfig();
                        break;
                    default :
                        break;
                }
                return self.$request({
                    url: uri,
                    headers: headers,
                    method: method,
                    data: data
                }).then(function (response) {
                    return resolve(response);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        return function () {
            this.createRequest = createRequest;
            return this;
        }
    })();

    // Registering mixin globally
    $window.ApyCompositeMixin =  (function () {

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
         *
         * @param resource
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
         *
         * @param resource
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
         *
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

        function isEmpty(obj) {
            var key;
            for (key in obj) {
                return (false);
            }
            return (true);
        }

        /**
         *
         * @returns {{}}
         */
        function cleanedData () {
            var cleaned = {};
            this.$components.forEach(function (comp) {
                var data = comp.cleanedData();
                if(data) {
                    cleaned[comp.$name] = data;
                }
            });
            if(isEmpty(cleaned)) {
                cleaned = undefined;
            }
            return cleaned;
        }

        /**
         *
         * @returns {boolean}
         */
        function hasUpdated () {
            if(this.$selfUpdated) {
                return true;
            }
            var updated = false;
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated && comp.hasUpdated()) {
                    updated = true;
                }
            });
            return updated;
        }

        /**
         *
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
         *
         * @param update
         * @param commit
         * @returns {ApyResourceComponent}
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
            // Commit => save the inner state ($value, $memo) of each component recursively
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
