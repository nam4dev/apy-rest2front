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
    var Settings = function () {
        return {
            theme: 'bs3',
            availableThemes: [
                'bs3'
            ],
            $endpoint: function () {
                return (
                    this.endpoints.root.hostname
                    + ':' +
                    this.endpoints.root.port
                );
            },
            $definitionsEndpoint: function () {
                return (
                    this.endpoints.root.hostname
                    + ':' +
                    this.endpoints.root.port
                    + '/' + this.endpoints.definitions
                );
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
                        meta: {
                            id: '_id',
                            etag: '_etag',
                            created: '_created',
                            updated: '_updated',
                            deleted: '_deleted'
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
                importRoot: 'apy-rest2front/integration/angular/',
                getViewByName: function(filename) {
                    return ((this.TRUE) ? this.importRoot : '') + filename;
                }
            },
            authentication: {
                enabled: true,
                grant_type: 'password',
                endpoint: 'http://localhost:5000/oauth/token',
                client_id: '<your-client-id>',
                isEnabled: function() {
                    return (
                        this.enabled &&
                        this.client_id &&
                        this.endpoint &&
                        this.grant_type
                    );
                }
            },
            // FIXME: Remove when adapted
            devOptions: {
                mode: true,
                htmlRoot: 'apy-rest2front/integration/angular/'
            },
            endpoint: 'http://localhost:5000/',
            schemasEndpointName: 'schemas',
            auth: {
                enabled: true,
                grant_type: 'password',
                endpoint: 'http://localhost:5000/oauth/token',
                client_id: '<your-client-id>'
            },
            pkName: '_id',
            appTheme: 'bootstrap3',
            excludedEndpointByNames: ['logs'],
            schemas: {},
            $auth: function() {
                return (
                    this.auth &&
                    $apy.helpers.isObject(this.auth) &&
                    this.auth.enabled &&
                    this.auth.client_id &&
                    this.auth.endpoint &&
                    this.auth.grant_type
                );
            },
            viewPath: function(filename) {
                return ((this.devOptions.mode) ? this.devOptions.htmlRoot : '') + filename;
            }
            // FIXME: End Remove
        };
    };
    apy.settings = new Settings();
})( apy );

