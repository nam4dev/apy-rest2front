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
     *  RequestMixin offer a common interface to access
     *  low-level network resources
     *
     * @mixin RequestMixin
     * @memberOf apy.components
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
})();
