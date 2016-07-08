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
 *  Collection Component UTs
 *
 *  """
 */

describe("Component.Collection unit tests", function() {

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

    function _createCollection (service, name, endpoint, components) {
        return new ApyCollectionComponent(service || _createService(), name, endpoint || DEFAULT_ENDPOINT, components);
    }

    it("[createResource] A Resource instance shall be append to the Collection", function() {
        var col = _createCollection(undefined, 'tests');
        col.createResource();
        expect(col.count()).toEqual(1);
        expect(col.getChild(0) instanceof ApyResourceComponent).toBe(true);
    });

    it("[removeResource] Given Resource shall be spliced from the collection", function() {
        var col = _createCollection(undefined, 'tests');
        var resource = col.createResource();
        expect(col.count()).toEqual(1);
        expect(col.getChild(0) instanceof ApyResourceComponent).toBe(true);
        col.removeResource(resource);
        expect(col.count()).toEqual(0);
    });

    it("[setCreateState] CREATE State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('CREATE');
        };
        col.setCreateState();
    });

    it("[setReadState] READ State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('READ');
        };
        col.setReadState();
    });

    it("[setUpdateState] UPDATE State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('UPDATE');
        };
        col.setUpdateState();
    });

    it("[setDeleteState] DELETE State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('DELETE');
        };
        col.setDeleteState();
    });

    it("[load] Shall load data into Collection components", function() {
        var resources = [
            {test: []},
            {test: [1, 2]},
            {test: ["One", "Two"]}
        ];
        var col = _createCollection(undefined, 'tests');
        col.load(resources);
        expect(col.count()).toEqual(resources.length);
    });

    it("[clear] Shall clear Collection components", function() {
        var resourceCount = 5;
        var col = _createCollection(undefined, 'tests');
        for(var i=0; i<resourceCount; i++) {
            col.createResource();
        }
        expect(col.count()).toEqual(resourceCount);
        col.clear();
        expect(col.count()).toEqual(0);
    });
});
