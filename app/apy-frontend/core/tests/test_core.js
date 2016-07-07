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
 *  Core UTs
 *
 *  """
 */

describe("Core.core unit tests", function() {
    var DEFAULT_CONFIG = {};
    var DEFAULT_SCHEMAS = {
        test: {type: 'list'}
    };
    var DEFAULT_ENDPOINT = 'http://localhost/';

    var _createService = function ($log, $http, $upload, config) {
        var service = new ApyCompositeService($log, $http, $upload, config || DEFAULT_CONFIG);
        var schemasObj = new ApySchemasComponent(DEFAULT_ENDPOINT, DEFAULT_SCHEMAS, DEFAULT_CONFIG, service);
        service.$instance = schemasObj;
        service.$schemas = schemasObj.$componentArray;
        return service;
    };

    it("[loadSchemas] Shall load schemas synchronously", function () {
        var schemaName = 'test';
        var endpoint = 'https://www.tests.fr/';
        var deps = [
            {
                name: "log",
                value: {}
            },
            {
                name: "http",
                value: function () {}
            },
            {
                name: "upload",
                value: {
                    upload: function () {}
                }
            }
        ];
        var service = _createService();
        service.initEndpoints(endpoint, schemaName);
        service.setDependencies(deps[0], deps[1], deps[2]);
        // Mocking $syncHttp
        service.$syncHttp = {
            open: function () {
                expect(arguments[0]).toEqual('GET');
                expect(arguments[1]).toEqual(service.$schemasEndpoint);
                expect(arguments[2]).toBe(false);
            },
            send: function () {
                expect(arguments[0]).toEqual(null);
            },
            response: JSON.stringify(DEFAULT_SCHEMAS)
        };
        service.loadSchemas();
        expect(service.$instance instanceof ApySchemasComponent).toBe(true);
        expect(service.$schemas).toEqual(service.$instance.$components);
        expect(service.$schemasAsArray).toEqual(service.$instance.$componentArray);
    });

    it("[initEndpoints] Endpoints shall be set properly", function () {
        var schemaName = 'test';
        var endpoint = 'https://www.tests.fr/';
        var service = _createService();
        service.initEndpoints(endpoint, schemaName);
        expect(service.$endpoint).toEqual(endpoint);
        expect(service.$schemasEndpoint).toEqual(endpoint + schemaName);
    });

    it("[setDependencies] Dependencies shall be set properly", function () {
        var deps = [
            {
                name: "log",
                value: "LogObject"
            },
            {
                name: "http",
                value: "HttpObject"
            },
            {
                name: "upload",
                value: "UploadObject"
            }
        ];
        var service = _createService();
        service.setDependencies(deps[0], deps[1], deps[2]);
        expect(service.$log).toEqual(deps[0].value);
        expect(service.$http).toEqual(deps[1].value);
        expect(service.$upload).toEqual(deps[2].value);
    });

    it("[createCollection] Shall create an ApyCollectionComponent instance", function () {
        var schemaName = 'test';
        var endpoint = 'https://www.tests.fr/';
        var deps = [
            {
                name: "log",
                value: {}
            },
            {
                name: "http",
                value: function () {}
            },
            {
                name: "upload",
                value: {
                    upload: function () {}
                }
            }
        ];
        var service = _createService();
        service.initEndpoints(endpoint, schemaName);
        service.setDependencies(deps[0], deps[1], deps[2]);

        var collection = service.createCollection(schemaName);
        expect(collection instanceof ApyCollectionComponent).toBe(true);
    });
});