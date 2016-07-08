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
 *  Resource Component UTs
 *
 *  """
 */

describe("Component.Resource unit tests", function() {

    var DEFAULT_CONFIG = {};
    var DEFAULT_SCHEMAS = {
        tests: {
            test: {type: 'list'}
        }
    };
    var DEFAULT_SCHEMA_NAME = 'test';
    var DEFAULT_ENDPOINT = 'http://localhost/';

    var _createService = function ($log, $http, $upload, config) {
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
        var service = new ApyCompositeService($log, $http, $upload, config || DEFAULT_CONFIG);
        service.setDependencies(deps[0], deps[1], deps[2]);
        service.initEndpoints(DEFAULT_ENDPOINT, DEFAULT_SCHEMA_NAME);
        service.setSchemas(DEFAULT_SCHEMAS);
        return service;
    };

    function _createResource(service, name, schema, components, $states, $endpoint, type, relationName) {
        return new ApyResourceComponent(service || _createService(), name, schema, components, $states, $endpoint, type, relationName);
    }

    it("[toString] With some $required fields, Only required field's value shall be displayed", function() {
        var expectedValue = "[One, Three]";
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.add({$required: true, $value: "One"});
        resource.add({$required: false, $value: "Two"});
        resource.add({$required: true, $value: "Three"});
        expect(resource.toString()).toEqual(expectedValue);
        expect('' + resource).toEqual(expectedValue);
    });

    it("[toString] With no $required fields, All field's value shall be displayed", function() {
        var expectedValue = "[One, Two, Three]";
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.add({$required: false, $value: "One"});
        resource.add({$value: "Two"});
        resource.add({$value: "Three"});
        expect(resource.toString()).toEqual(expectedValue);
        expect('' + resource).toEqual(expectedValue);
    });

    it("[setCreateState] CREATE State shall be passed", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.setCreateState();
        expect(resource.$states.$current).toEqual('CREATE');
    });

    it("[setReadState] READ State shall be passed", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.setReadState();
        expect(resource.$states.$current).toEqual('READ');
    });

    it("[setUpdateState] UPDATE State shall be passed", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.setUpdateState();
        expect(resource.$states.$current).toEqual('UPDATE');
    });

    it("[setDeleteState] DELETE State shall be passed", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.setDeleteState();
        expect(resource.$states.$current).toEqual('DELETE');
    });

    it("[reset] $selfUpdated shall be false", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource._id = undefined;
        expect(resource.hasCreated()).toBe(true);
    });

    it("[hasCreated] Shall return true as pkName is not set", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.$selfUpdated = true;
        resource.reset();
        expect(resource.$selfUpdated).toBe(false);
    });

    it("[hasCreated] Shall return false as pkName is set", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource._id = "01234567899876543210";
        expect(resource.hasCreated()).toBe(false);
    });

    it("[hasUpdated] Shall return true ($selfUpdated = true)", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.$selfUpdated = true;
        expect(resource.hasUpdated()).toBe(true);
    });

    it("[hasUpdated] Shall return true ($selfUpdated = false, some components are true)", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.$selfUpdated = false;
        resource.add({
            hasUpdated: function () {
                return false;
            }
        });
        resource.add({
            hasUpdated: function () {
                return false;
            }
        });
        resource.add({
            hasUpdated: function () {
                return true;
            }
        });
        expect(resource.count()).toEqual(3);
        expect(resource.hasUpdated()).toBe(true);
    });
});