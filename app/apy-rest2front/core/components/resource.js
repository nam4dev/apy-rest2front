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
     * Apy Resource Component
     *
     * @class apy.components.Resource
     *
     * @augments apy.components.ComponentMixin
     * @augments apy.components.CompositeMixin
     * @augments apy.components.RequestMixin
     *
     * @example
     * var endpoint = 'http://localhost:5000/';
     * // Schema (usually it comes from REST API or configuration, not that way)
     * var post = {
     *     item_title: "Post",
     *     schema: {
     *         description: {
     *             type: "string"
     *         },
     *         title: {
     *             type: "string"
     *         }
     *     }
     * };
     * // Associated data (usually, data is bound to some UI framework)
     * var postData = {
     *     title: "A nice title",
     *     description: "And another nice description..."
     * };
     * // Service is usually initialized by UI framework in charge of representing data
     * var service = new apy.CompositeService(...);
     * var resource = new apy.components.Resource(service, post.item_title, post.schema, postData, null, endpoint);
     * function error(e) {
     *     console.log('CREATE Error', e);
     * }
     * function success(response) {
     *     if(!response) console.log('Nothing to create');
     *     else console.log('CREATE ', response);
     * }
     * resource.create()
     *         .then(success)
     *         .catch(error);
     *
     * @param {apy.CompositeService} service Service instance
     * @param {string} name Resource name
     * @param {string} type Resource type
     * @param {Object} schema Resource schema
     * @param {Object} value Resource value
     * @param {apy.helpers.StateHolder} $states Resource inner state holder instance
     * @param {Array} components Resource initial components
     * @param {string} endpointBase Resource endpoint
     * @param {string} relationName (optional) Resource relation name
     */
    $apy.components.Resource = (function Resource() {
        /**
         * Allow to know if the Resource is a fresh created Resource or loaded one
         * (_id ? hasCreated : not)
         *
         * @memberOf apy.components.Resource
         * @return {boolean} Has the Resource been created ?
         */
        function hasCreated() {
            var id = this.$template.id;
            return this.hasOwnProperty(id) && !this[id];
        }

        /**
         * Wraps common `createRequest` method
         * adding some specific Resource logic.
         *
         * On success, the Resource inner (meta-)data
         * are automatically updated and its state
         * restored to READ while passing the response as-is.
         *
         * On failure, error is logged and passed as-is.
         *
         * @memberOf apy.components.Resource
         *
         * @param {string} method The HTTP Method Verb (GET, POST, DELETE, ...)
         *
         * @return {Promise} Asynchronous call
         */
        function createResourceRequest(method) {
            var self = this;
            return new Promise(function(resolve, reject) {
                if (self.$endpointBase && self.$name) {
                    var on_success = function(response) {
                        console.log(response);
                        self.selfUpdate(response, true);
                        self.setReadState();
                        return resolve(response);
                    };
                    var on_failure = function(error) {
                        console.error(error);
                        return reject(error);
                    };
                    var on_progress = function(evt) {
                        console.log('[RESOURCE::createResourceRequest] => progress', evt);
                    };
                    return self.createRequest(self.$endpointBase + self.$name, method)
                        .then(on_success, on_failure, on_progress);
                }
                return reject({
                    data: {
                        _error: {
                            message: 'Resource does not have valid ' +
                            '\'$endpoint\' or \'$name\' (' + self.$endpoint + ', '
                            + self.$name + ')'
                        }
                    }
                });
            });
        }

        /**
         * If the Resource is created & updated,
         * a POST Request is sent to the backend.
         *
         * @memberOf apy.components.Resource
         * @return {Promise} Asynchronous call
         */
        function create() {
            if (this.hasCreated() && this.hasUpdated()) {
                return this.createResourceRequest();
            }
            return Promise.resolve(null);
        }

        /**
         * If the Resource is not created & updated,
         * a PATCH Request is sent to the backend.
         *
         * @memberOf apy.components.Resource
         * @return {Promise} Asynchronous call
         */
        function update() {
            if (this.hasUpdated() && !this.hasCreated()) {
                return this.createResourceRequest('PATCH');
            }
            return Promise.resolve(null);
        }

        /**
         * If the Resource is not created,
         * a DELETE Request is sent to the backend.
         *
         * @alias delete
         * @memberOf apy.components.Resource
         * @return {Promise} Asynchronous call
         */
        function del() {
            if (!this.hasCreated()) {
                return this.setDeleteState().createResourceRequest('DELETE');
            }
            return Promise.resolve(null);
        }

        /**
         * Resource Constructor
         *
         * @param {string} name Resource name
         * @param {string} type Resource type
         * @param {Object} schema Resource schema
         * @param {Object} value Resource value
         * @param {apy.helpers.StateHolder} $states Resource inner state holder instance
         * @param {Array} components Resource initial components
         * @param {string} endpointBase Resource endpoint
         * @param {string} relationName (optional) Resource relation name
         *
         * @constructor
         */
        return function(service, name, schema, value, $states, $endpoint, type, relationName, components) {
            type = type || $apy.helpers.$TYPES.RESOURCE;

            this.$template = $apy.settings.get().bTemplate();

            this.delete = del;
            this.create = create;
            this.update = update;
            this.hasCreated = hasCreated;
            this.createResourceRequest = createResourceRequest;

            var st = $states || this.createStateHolder();

            this.initialize(service, name, schema, value, st, $endpoint, type, relationName, components);
            this.$selfUpdated = false;
            this.$endpointBase = $endpoint;
            this.$Class = $apy.components.Resource;

            if (relationName)
                this.$endpoint += relationName;
            if (schema && schema.$embeddedURI)
                this.$endpoint += '?' + schema.$embeddedURI;

            this.load(value);

            this.$render = schema.$render;

            return this;
        };
    })();

// Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.Resource.prototype
    );
    $apy.components.RequestMixin.call(
        $apy.components.Resource.prototype
    );
    $apy.components.CompositeMixin.call(
        $apy.components.Resource.prototype
    );
})(apy);
