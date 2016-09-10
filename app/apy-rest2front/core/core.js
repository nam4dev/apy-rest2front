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
(function($apy) {
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
     * @augments apy.components.RequestMixin
     *
     * @example
     * var settings = $apy.settings.create({
     *    // configuration example
     *    endpoints: {
     *        root: {
     *            port: 5000,
     *            hostname: "http://localhost"
     *        }
     *    },
     *    authentication: {
     *        enabled: true,
     *        grant_type: 'password',
     *        endpoint: 'http://localhost:5000/oauth/token',
     *        client_id: '<your-client-id>'
     *    },
     *    development: {
     *        TRUE: true
     *    }
     * });
     * angular.module('myModule', [])
     *     .provider('apy', function apyProvider() {
     *          this.$get = function apyFactory() {
     *              var $injector = angular.injector(['ng', 'ngFileUpload']);
     *              $apy.settings.set('$http', $injector.get('$http'));
     *              $apy.settings.set('$upload', $injector.get('Upload'));
     *              return new $apy.CompositeService();
     *          };
     *      })
     *      .controller('indexCtrl', ['$scope', 'apy', function($scope, apyProvider) {}]);
     */
    $apy.CompositeService = (function CompositeService() {

        /**
         * Authentication invalidation
         *
         * @memberOf apy.CompositeService
         *
         * @return {Promise} Asynchronous call
         */
        function invalidate() {
            var nil = null;
            this.$tokenInfo = nil;
            return Promise.resolve(nil);
        }

        /**
         * Property method which holds,
         * whether or not the User is authenticated
         *
         * @memberOf apy.CompositeService
         *
         * @param {Function} source Any function returning token info.
         *
         * @return {Boolean} Whether User is authenticated or not
         */
        function isAuthenticated(source) {
            source = source || function() {
                return null;
            };
            var tokenInfo = this.$tokenInfo || source();
            if (tokenInfo && !$apy.helpers.isObject(tokenInfo)) {
                try {
                    tokenInfo = JSON.parse(tokenInfo);
                } catch (JSONError) {
                    return false;
                }
            }
            this.$tokenInfo = tokenInfo;
            return $apy.helpers.isObject(tokenInfo);
        }

        /**
         * Authenticate against Authentication Server (Oauth2 protocol)
         *
         * @memberOf apy.CompositeService
         *
         * @param {Object} credentials Object representing credentials
         * @param {string} credentials.client_id Oauth2 `CLIENT ID`
         * @param {string} credentials.grant_type Oauth2 `GRANT TYPE` (eg. password)
         * @param {string} credentials.username `USERNAME`
         * @param {string} credentials.password `PASSWORD`
         * @param {string} method HTTP Method Verb (GET, POST)
         * @param {Object} headers (optional) HTTP Headers
         *
         * @return {Promise} Asynchronous call
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
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str.push(pairEncoding(p));
                    }
                }
                return str.join('&');
            };
            var requestHeaders = headers || defaultHeaders;
            if (!credentials.client_id) {
                credentials.client_id = this.$auth.client_id;
            }
            if (!credentials.grant_type) {
                credentials.grant_type = this.$auth.grant_type;
            }
            return new Promise(function(resolve, reject) {
                self.$access({
                    url: self.$auth.endpoint,
                    method: method || 'POST',
                    headers: requestHeaders,
                    data: credentials,
                    transformRequest: transform

                })
                    .then(resolve,
                    function(error) {
                        return reject(new $apy.errors.EveHTTPError(error));
                    });
            });
        }

        /**
         * Schemas Setter
         *
         * @memberOf apy.CompositeService
         *
         * @param {Object} schemas The Schemas object got from config or backend endpoint
         *
         * @return {apy.CompositeService} itself (chaning pattern)
         */
        function setSchemas(schemas) {
            var ins = this.$instance = new $apy.components.Schemas(this.$endpoint, schemas, this);
            this.$schemas = ins.$components;
            this.$schemasAsArray = ins.$componentArray;
            return this;
        }

        /**
         * Load schema definitions endpoint (a)synchronously
         *
         * Template method to manage (a)synchronous worlds
         *
         * @memberOf apy.CompositeService
         *
         * @param {boolean} async Load asynchronously or not
         *
         * @return {Promise} Asynchronous call
         */
        function loadSchemas(async) {
            if (async) {
                return this.asyncLoadSchemas();
            }
            this.$syncHttp.open('GET', this.$schemasEndpoint, async);
            this.$syncHttp.send(null);
            var response = JSON.parse(this.$syncHttp.response);
            this.setSchemas(response);
            return response;
        }

        /**
         * Load schema definitions endpoint asynchronously
         *
         * @memberOf apy.CompositeService
         *
         * @return {Promise} Asynchronous call
         */
        function asyncLoadSchemas() {
            var self = this;
            return new Promise(function(resolve, reject) {
                self.$access({
                    url: self.$schemasEndpoint,
                    method: 'GET'
                })
                    .then(function(response) {
                        self.setSchemas(response.data);
                        return resolve(response);
                    }, function(error) {
                        return reject(new $apy.errors.EveHTTPError(error));
                    });
            });
        }

        /**
         * Set dependencies
         *
         * @memberOf apy.CompositeService
         *
         * @return {apy.CompositeService} itself (chaining pattern)
         */
        function setDependencies() {
            for (var i = 0; i < arguments.length; ++i) {
                // i is always valid index in the arguments object
                this['$' + arguments[i].name] = arguments[i].value;
            }
            return this;
        }

        /**
         * Create a collection instance
         *
         * @memberOf apy.CompositeService
         *
         * @param {string} name Backend Resource name
         * @param {Array} components A list of initial components
         *
         * @return {apy.components.Collection} Created Collection
         */
        function createCollection(name, components) {
            return new $apy.components.Collection(this, name, this.$endpoint, components);
        }

        /**
         * The ApyService provides an Object which will load,
         * each of your Eve's REST API schema endpoint(s) and gives you:
         *
         *  * A full CRUD MMI for each (Tables, Lists, Forms, ...)
         *  * A configurable endpoint URI
         *  * A configurable CSS theme (default: Bootstrap 3)
         *
         * @constructor
         */
        return function() {
            this.$schemas = null;
            this.$endpoint = null;
            this.$instance = null;
            this.$tokenInfo = null;
            this.$schemasAsArray = null;
            this.$schemasEndpoint = null;

            // Get Singleton Settings instance
            this.$settings = $apy.settings.get();

            this.$theme = this.$settings.theme;
            this.$auth = this.$settings.authentication;
            this.$endpoint = this.$settings.$endpoint();
            this.$syncHttp = this.$settings.httpHandler(true);
            this.$schemasEndpoint = this.$settings.$definitionsEndpoint();

            this.setSchemas = setSchemas;
            this.invalidate = invalidate;
            this.loadSchemas = loadSchemas;
            this.authenticate = authenticate;
            this.isAuthenticated = isAuthenticated;
            this.setDependencies = setDependencies;
            this.createCollection = createCollection;
            this.asyncLoadSchemas = asyncLoadSchemas;

            return this;
        };
    })();

    $apy.components.RequestMixin.call($apy.CompositeService.prototype);
})(apy, window);
