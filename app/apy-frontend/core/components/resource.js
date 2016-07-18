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

        var STATES = {
            CREATE: 'CREATE',
            READ: 'READ',
            UPDATE: 'UPDATE',
            DELETE: 'DELETE'
        };

        /**
         *
         */
        function setCreateState () {
            this.$states.set(STATES.CREATE);
            return this;
        }

        /**
         *
         */
        function setReadState () {
            this.$states.set(STATES.READ);
            return this;
        }

        /**
         *
         */
        function setUpdateState () {
            this.$states.set(STATES.UPDATE);
            return this;
        }

        /**
         *
         */
        function setDeleteState () {
            this.$states.set(STATES.DELETE);
            return this;
        }

        /**
         *
         * @returns {boolean}
         */
        function hasCreated () {
            // FIXME: Ensure default value according chosen backend (for now only python-eve is available)
            var pkAttributeName = this.$service.$config.pkName || '_id';
            return this.hasOwnProperty(pkAttributeName) && !this[pkAttributeName];
        }

        function createResourceRequest(method) {
            var self = this;
            return new Promise(function (resolve, reject) {

                if(self.$endpointBase && self.$name) {
                    var successCb = function (response) {
                        self.$log(response);
                        self.selfUpdate(response.data, true);
                        self.setReadState();
                        return resolve(response);
                    };
                    var errorCb = function (error) {
                        self.$log(error);
                        return reject(error);
                    };
                    return self.createRequest(self.$endpointBase + self.$name, method)
                        .then(successCb)
                        .catch(errorCb);
                }
                return reject({
                    data: {
                        _error: {
                            message: "Resource does not have valid " +
                            "'$endpoint' or '$name' (" + self.$endpoint + ", "
                            + self.$name + ")"
                        }
                    }
                });
            });
        }

        /**
         *
         * @returns {Promise}
         */
        function create () {
            if(this.hasCreated() && this.hasUpdated()) {
                return this.createResourceRequest();
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
                return this.createResourceRequest('PATCH');
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
                return this.setDeleteState().createResourceRequest('DELETE');
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
        return function (service, name, schema, value, $states, $endpoint, type, relationName, components) {
            type = type || $TYPES.RESOURCE;

            this.delete = del;
            this.create = create;
            this.update = update;
            this.hasCreated = hasCreated;
            this.setReadState = setReadState;
            this.setCreateState = setCreateState;
            this.setUpdateState = setUpdateState;
            this.setDeleteState = setDeleteState;
            this.createStateHolder = createStateHolder;
            this.createResourceRequest = createResourceRequest;

            var st = $states || this.createStateHolder(STATES.READ, STATES);

            this.initialize(service, name, schema, value, st, $endpoint, type, relationName, components);
            this.$selfUpdated = false;
            this.$endpointBase = $endpoint;
            this.$Class = $window.ApyResourceComponent;

            if(relationName)
                this.$endpoint += relationName;
            if(schema && schema.$embeddedURI)
                this.$endpoint += '?' + schema.$embeddedURI;

            this.load(value);

            return this;
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyResourceComponent.prototype);
    $window.ApyRequestMixin.call(ApyResourceComponent.prototype);
    $window.ApyCompositeMixin.call(ApyResourceComponent.prototype);

})(window);
