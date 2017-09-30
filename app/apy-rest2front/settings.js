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
 *  Apy REST2Front Settings mechanism
 *
 *  """
 */
(function ($apy) {

    /**
     *
     * @class apy.settings._Settings
     *
     * @param {Object} settings Settings object,
     *  representing user-specific settings
     */
    function _Settings(settings) {

        var bTemplate;
        var fTemplate;

        return $.extend(true, {
            theme: 'bs3',
            availableThemes: [
                'bs3'
            ],
            /**
             * @memberOf apy.settings._Settings
             *
             * @return {string}
             */
            $endpoint: function $endpoint() {
                return (
                    this.endpoints.root.hostname
                    + ':' +
                    this.endpoints.root.port
                    + '/'
                );
            },
            /**
             * @memberOf apy.settings._Settings
             *
             * @return {string}
             */
            $definitionsEndpoint: function $definitionsEndpoint() {
                return (
                    this.$endpoint() + this.endpoints.definitions
                );
            },
            /**
             * @memberOf apy.settings._Settings
             *
             * @param name
             * @return {string}
             */
            getIconByName: function (name) {
                return ((this.development.TRUE) ? this.development.importRoot + 'common/' : '') + name;
            },
            /**
             * @memberOf apy.settings._Settings
             *
             * @param name
             * @return {string}
             */
            getViewByName: function(name) {
                return ((this.development.TRUE) ? (this.development.importRoot + this.templates.frontend + '/') : '') + name + '.html';
            },
            /**
             * @memberOf apy.settings._Settings
             *
             * @return {*}
             */
            bTemplate: function () {
                if(!bTemplate) {
                    bTemplate = this.availableTemplates.backend[this.templates.backend];
                }
                return bTemplate;
            },
            /**
             * @memberOf apy.settings._Settings
             *
             * @return {*}
             */
            fTemplate: function () {
                if(!fTemplate) {
                    fTemplate = this.availableTemplates.frontend[this.templates.frontend];
                }
                return fTemplate;
            },
            endpoints: {
                excluded: [
                    'logs'
                ],
                definitions: "schemas",
                root: {
                    port: 5000,
                    hostname: "localhost"
                }
            },
            templates: {
                backend: "eve",
                frontend: "angular"
            },
            availableTemplates: {
                backend: {
                    eve: {
                        id: '_id',
                        etag: '_etag',
                        created: '_created',
                        updated: '_updated',
                        deleted: '_deleted',
                        embedded: {
                            enabled: true,
                            key: 'embedded'
                        }
                    }
                },
                frontend: {
                    angular: {

                    }
                }
            },
            schemaOverrides: {},
            development: {
                TRUE: false,
                importRoot: 'apy-rest2front/integration/'
            },
            authentication: {
                enabled: false,
                userKey: 'User',
                storage: localStorage,
                grant_type: 'password',
                client_id: '<my-client-id>',
                endpoint: '<my-authentication-endpoint>',
                isEnabled: function() {
                    // Can be overridden
                    return (
                        this.enabled &&
                        this.client_id &&
                        this.endpoint &&
                        this.grant_type
                    );
                },
                // eslint-disable-next-line no-unused-vars
                transformData: function (data) {
                    // Transform data payload
                    // according to your auth backend
                },
                isAuthenticated: function() {
                    // Can be overridden
                    return (
                        this.storage &&
                        this.storage.getItem(this.userKey)
                    );
                },
                transformResponse: function(authUser) {
                    // The Response expects a JSON string
                    // containing data with attributes:
                    // - token_type (Bearer, ...);
                    // - access_token (token-based string);
                    return authUser;
                }
            }
        }, settings);
    }

    /**
     *
     * @class apy.settings.Settings
     *
     */
    function Settings() {
        var _settings;

        return {
            /**
             * accessor
             *
             * @memberOf apy.settings.Settings
             *
             * @return {*}
             */
            get: function () {
                return _settings;
            },
            /**
             *
             * @memberOf apy.settings.Settings
             *
             * @param id
             * @param value
             */
            set: function (id, value) {
                _settings[id] = value;
            },
            /**
             * Get or Create a _Settings instance.
             *
             * @memberOf apy.settings.Settings
             *
             * @param settings
             * @return {_Settings}
             */
            create: function (settings) {
                if(!_settings) {
                    _settings = new _Settings(settings);
                }
                else {
                    throw new $apy.errors.ApyError('Settings cannot be set twice!');
                }
                return _settings;
            },
            /**
             *
             * @memberOf apy.settings.Settings
             *
             * @param settings
             * @return {*}
             */
            getOrCreate: function (settings) {
                var __settings = this.get();
                if (!__settings) {
                    __settings = this.create(settings);
                }
                return __settings;
            }
        }

    }
    $apy.settings = new Settings();
})(apy);

