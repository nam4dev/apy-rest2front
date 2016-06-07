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
 *  Apy Resource Component abstraction
 *
 *  """
 */
(function ($window) {

    $window.ApyResourceComponent = (function () {

        var states              = [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE'
        ];

        /**
         *
         * @returns {ApyResourceComponent}
         */
        function initRequest () {
            this.$request = (this.$schema && this.$schema.$hasMedia) ? this.$upload.upload : this.$http;
            return this;
        }

        /**
         *
         * @returns {string}
         */
        function toString() {
            var filtered = this.$components.filter(function (c) {
                return c.$required;
            });
            if(filtered.length)
                return '[' + filtered.join(', ') + ']';

            filtered = this.$components.filter(function (c) {
                return c.$value;
            });
            return '[' + filtered.join(', ') + ']';
        }

        /**
         *
         */
        function setCreateState () {
            this.$states.set(states[0]);
            return this;
        }

        /**
         *
         */
        function setReadState () {
            this.$states.set(states[1]);
            return this;
        }

        /**
         *
         */
        function setUpdateState () {
            this.$states.set(states[2]);
            return this;
        }

        /**
         *
         */
        function setDeleteState () {
            this.$states.set(states[3]);
            return this;
        }

        /**
         *
         */
        function reset () {
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated()) comp.reset();
            });
            if(this.$selfUpdated) this.$selfUpdated = false;
            this.loadValue();
        }

        /**
         *
         * @returns {boolean}
         */
        function hasCreated () {
            var pkAttributeName = this.$service.$config.pkName;
            return this.hasOwnProperty(pkAttributeName) && !this[pkAttributeName];
        }

        /**
         *
         * @returns {boolean}
         */
        function hasUpdated () {
            if(this.$selfUpdated) return true;
            var updated = false;
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated()) updated = true;
            });
            return updated;
        }

        /**
         *
         */
        function selfCommit () {
            this.$components.forEach(function (comp) {
                comp.selfCommit();
                if(comp.$selfUpdated) {
                    comp.$selfUpdated = false;
                }
            });
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
                        comp.selfUpdate(update.$components[index]);
                    }
                });
            }
            // Commit => save the inner state ($value, $memo) of each component recursively
            this.$selfUpdated = !commit;
            if (commit) this.selfCommit();
            return this;
        }

        /**
         *
         * @param response
         * @returns {ApyResourceComponent}
         */
        function loadResponse (response) {
            return this.selfUpdate(response.data, true);
        }

        /**
         *
         * @param method
         * @returns {Promise}
         */
        function createRequest (method) {
            var self = this;
            method = method || 'POST';
            return new Promise(function (resolve, reject) {
                var uri = self.$endpointBase + self.$name;
                var data = null;
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
                    self.$logging.debug(response);
                    self.loadResponse(response);
                    self.setReadState();
                    return resolve(response);
                }).catch(function (error) {
                    self.$logging.error(error);
                    return reject(error);
                });
            });
        }

        /**
         *
         * @returns {Promise}
         */
        function create () {
            console.log('this.hasCreated()', this.hasCreated(), 'this.hasUpdated()', this.hasUpdated());
            if(this.hasCreated() && this.hasUpdated()) {
                return this.createRequest();
            }
            else {
                this.setReadState();
            }
        }

        /**
         *
         * @returns {Promise}
         */
        function update () {
            if(this.hasUpdated()) {
                return this.createRequest('PATCH');
            }
            else {
                this.setReadState();
            }
        }

        /**
         *
         * @returns {Promise}
         */
        function del () {
            if(!this.hasCreated()) {
                return this.setDeleteState().createRequest('DELETE');
            }
        }

        /**
         *
         * @param states
         * @param initialState
         */
        function createStateHolder (initialState, states) {
            return new ApyStateHolder(initialState, states);
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
                var subSchema = this.$schema[field];
                try {
                    var type = subSchema.type;
                }
                catch(e) {
                    continue;
                }
                var fieldObj,
                    value = resource[field] || this.$service.$instance.schema2data(subSchema, field);
                switch(type) {
                    case this.$types.LIST:
                        fieldObj = new ApyListField(this.$service, field, subSchema, value, this.$states, this.$endpointBase);
                        break;
                    case this.$types.DICT:
                        fieldObj = new ApyResourceComponent(this.$service, field, subSchema.schema, null, this.$states, null, this.$types.RESOURCE);
                        fieldObj.load(value);
                        if(!subSchema.schema) {
                            var poly = new ApyPolyField(this.$service, field, null, null, this.$states, this.$endpointBase);
                            poly.setParent(fieldObj);
                            fieldObj.add(poly);
                        }
                        break;
                    case this.$types.MEDIA:
                        fieldObj = new ApyMediaField(this.$service, field, subSchema, value, this.$states, this.$endpointBase);
                        break;
                    case this.$types.STRING:
                        fieldObj = new ApyStringField(this.$service, field, subSchema, value, this.$states, this.$endpointBase);
                        break;
                    case this.$types.FLOAT:
                    case this.$types.NUMBER:
                    case this.$types.INTEGER:
                        fieldObj = new ApyNumberField(this.$service, field, subSchema, value, this.$states, this.$endpointBase);
                        break;
                    case this.$types.BOOLEAN:
                        fieldObj = new ApyBooleanField(this.$service, field, subSchema, value, this.$states, this.$endpointBase);
                        break;

                    case this.$types.DATETIME:
                        fieldObj = new ApyDatetimeField(this.$service, field, subSchema, value, this.$states, this.$endpointBase);
                        break;
                    case this.$types.OBJECTID:
                        var relationName = subSchema.data_relation.resource;
                        var schemaObject = this.$service.$schemas[relationName];



                        fieldObj = new ApyResourceComponent(this.$service, field, schemaObject, null,
                            this.$states, this.$endpointBase, this.$types.OBJECTID, relationName);
                        fieldObj.load(value);
                        break;
                    default:
                        throw new Error('Unknown type ' + type);
                        break;
                }
                fieldObj.setParent(this);
                this.add(fieldObj);
            }
            this.loadValue();
            return this;
        }

        /**
         *
         * @returns {{}}
         */
        function cleanedData () {
            var cleaned = {};
            this.$components.forEach(function (item) {
                var data;
                switch (item.$type) {
                    case $TYPES.OBJECTID:
                        data = item._id;
                        break;
                    default :
                        data = item.cleanedData();
                        break;
                }
                // `if` check avoids to add something
                // which might be required but already filled.
                // Specifically with Media Resource Component.
                if(data) cleaned[item.$name] = data;
            });
            return cleaned;
        }

        /**
         *
         * @param resource
         * @returns {ApyResourceComponent}
         */
        function load (resource) {
            var self = this;
            resource = resource || {};
            Object.keys(Object.assign(resource)).forEach(function (k) {
                if(self.continue(k)) {
                    self[k] = resource[k];
                    delete resource[k];
                }
            });
            this._load(resource);
            return this;
        }

        /**
         * ApyResourceComponent
         *
         * @param name
         * @param type
         * @param schema
         * @param $states
         * @param components
         * @param endpointBase
         * @param relationName
         * @constructor
         */
        return function (service, name, schema, components, $states, $endpoint, type, relationName) {
            type = type || "resource";
            this.$value = '';
            this.$schema = schema;
            this.$selfUpdated = false;
            this.$endpoint = $endpoint;
            this.$endpointBase = $endpoint;
            this.$relationName = relationName;
            this.$Class = $window.ApyResourceComponent;
            if(relationName)
                this.$endpoint += relationName;
            if(schema && schema.$embeddedURI)
                this.$endpoint += '?' + schema.$embeddedURI;

            this.initRequest       = initRequest      ;
            this.toString          = toString         ;
            this.setCreateState    = setCreateState   ;
            this.setReadState      = setReadState     ;
            this.setUpdateState    = setUpdateState   ;
            this.setDeleteState    = setDeleteState   ;
            this.reset             = reset            ;
            this.hasCreated        = hasCreated       ;
            this.hasUpdated        = hasUpdated       ;
            this.selfCommit        = selfCommit       ;
            this.selfUpdate        = selfUpdate       ;
            this.loadResponse      = loadResponse     ;
            this.createRequest     = createRequest    ;
            this.create            = create           ;
            this.update            = update           ;
            this.delete            = del              ;
            this.createStateHolder = createStateHolder;
            this._load             = _load            ;
            this.cleanedData       = cleanedData      ;
            this.load              = load             ;

            this.$states = $states || this.createStateHolder(states[1], states);
            this.init(service, name, components, type);

            return this.initRequest();
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyResourceComponent.prototype);
    $window.ApyResourceComponent = ApyResourceComponent;

})(window);
