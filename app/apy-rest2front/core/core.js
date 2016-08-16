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
 *  Copyright (C) 2016 Namgyal Brisson
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
 *  `apy-rest2front`  Copyright (C) 2016 Namgyal Brisson.
 */
(function ( $apy ) {

    /**
     *  The ApyService provides an Object which will load,
     *  each of your Eve's REST API schema endpoint(s) and gives you:
     *
     *  * A full CRUD MMI for each (Tables, Lists, Forms, ...)
     *  * A configurable endpoint URI
     *  * A configurable CSS theme (default: Bootstrap 3)
     *
     * @class apy.CompositeService
     *
     * @augments RequestMixin
     *
     * @param $log
     * @param $http
     * @param $upload
     * @param config
     */
    $apy.CompositeService = (function CompositeService() {

        /**
         *
         * @param name
         * @memberOf apy.CompositeService
         */
        function logMissingProvider(name) {
            console.error('No "'+ name + '" Provider available!');
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.CompositeService
         */
        function invalidate() {
            var nil = null;
            this.$tokenInfo = nil;
            return Promise.resolve(nil);
        }

        /**
         *  Property method which holds,
         *  whether or not the User is authenticated
         *
         *  @method
         *  @returns {Boolean}
         *  @memberOf apy.CompositeService
         */
        function isAuthenticated(source) {
            source = source|| function () {
                return null;
            };
            var tokenInfo = this.$tokenInfo||source();
            if(tokenInfo && !$apy.helpers.isObject(tokenInfo)) {
                try {
                    tokenInfo = JSON.parse(tokenInfo);
                } catch(JSONError) {
                    return false;
                }
            }
            this.$tokenInfo = tokenInfo;
            return ($apy.helpers.isObject(this.$tokenInfo)) ? true : false;
        }

        /**
         *
         * @param credentials
         * @param method
         * @param headers
         * @returns {Promise}
         * @memberOf apy.CompositeService
         */
        function authenticate(credentials, method, headers) {
            var self = this;
            var defaultHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            var transform = function(obj) {
                function pairEncoding(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
                }
                var str = [];
                for(var p in obj) {
                    if(obj.hasOwnProperty(p)) {
                        str.push(pairEncoding(p));
                    }
                }
                return str.join('&');
            };
            var requestHeaders = headers || defaultHeaders;
            if(!credentials.client_id) {
                credentials.client_id = this.$auth.client_id;
            }
            if(!credentials.grant_type) {
                credentials.grant_type = this.$auth.grant_type;
            }
            return new Promise(function (resolve, reject) {
                self.$access({
                    url: self.$auth.endpoint,
                    method: method || 'POST',
                    headers: requestHeaders,
                    data: credentials,
                    transformRequest: transform

                })
                    .then(resolve,
                    function (error) {
                        return reject(new $apy.EveHTTPError(error));
                    });
            });
        }

        /**
         *
         * @param schemas
         * @memberOf apy.CompositeService
         */
        function setSchemas(schemas) {
            var ins = this.$instance = new $apy.components.Schemas(this.$endpoint, schemas, this.$config, this);
            this.$schemas = ins.$components;
            this.$schemasAsArray = ins.$componentArray;
            return this;
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.CompositeService
         */
        function loadSchemas(async) {
            if(async) {
                return this.asyncLoadSchemas();
            }
            this.$syncHttp.open('GET', this.$schemasEndpoint, async);
            this.$syncHttp.send(null);
            var response = JSON.parse(this.$syncHttp.response);
            this.setSchemas(response);
            return response;
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.CompositeService
         */
        function asyncLoadSchemas() {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.$access({
                    url: self.$schemasEndpoint,
                    method: 'GET'
                })
                    .then(function (response) {
                        self.setSchemas(response.data);
                        return resolve(response);
                    }, function (error) {
                        return reject(new $apy.EveHTTPError(error));
                    });
            });
        }

        /**
         *
         * @param endpoint
         * @param schemaName
         * @returns {this}
         * @memberOf apy.CompositeService
         */
        function initEndpoints(endpoint, schemaName) {
            this.$endpoint = endpoint;
            this.$schemasEndpoint = endpoint + schemaName;
            return this;
        }

        /**
         *
         * @returns {this}
         * @memberOf apy.CompositeService
         */
        function setDependencies() {
            for(var i = 0; i < arguments.length; ++i) {
                //i is always valid index in the arguments object
                this['$' + arguments[i].name] = arguments[i].value;
            }
            return this;
        }

        /**
         * Create a collection instance
         *
         * @function
         * @param name
         * @param components
         * @returns {Collection}
         * @memberOf apy.CompositeService
         */
        function createCollection(name, components) {
            return new $apy.components.Collection(this, name, this.$endpoint, components);
        }

        /**
         * @param $log
         * @param $http
         * @param $upload
         * @param config
         *
         * @constructor
         */
        return function($log, $http, $upload, config) {
            this.$log = $log;
            this.$tokenInfo = undefined;
            this.$http = $http || function () {
                logMissingProvider('$http');
                return Promise.resolve(arguments);
            };
            this.$config = config || {};
            this.$upload = $upload || {upload: function () {
                logMissingProvider('Upload');
                return Promise.resolve(arguments);
            }};
            this.$auth = config.auth || {};
            this.$theme = config.appTheme;
            this.$syncHttp = new XMLHttpRequest();
            this.$schemas = null;
            this.$endpoint = null;
            this.$instance = null;
            this.$schemasAsArray = null;
            this.$schemasEndpoint = null;

            this.setSchemas = setSchemas;
            this.invalidate = invalidate;
            this.loadSchemas = loadSchemas;
            this.authenticate = authenticate;
            this.initEndpoints = initEndpoints;
            this.isAuthenticated = isAuthenticated;
            this.setDependencies = setDependencies;
            this.createCollection = createCollection;
            this.asyncLoadSchemas = asyncLoadSchemas;

            this.initEndpoints(config.endpoint, config.schemasEndpointName);

            return this;
        };
    })();

    $apy.components.RequestMixin.call($apy.CompositeService.prototype);

})( apy, window );
