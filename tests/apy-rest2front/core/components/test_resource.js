/**
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
            test: {
                type: 'list',
                schema: {
                    type: "string"
                }
            }
        },
        parents: {
            name: { type: "string" }
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

    function _createResource(service, name, schema, value, $states, $endpoint, type, relationName, components) {
        return new ApyResourceComponent(service || _createService(), name, schema, value, $states, $endpoint, type, relationName, components);
    }

    it("[toString] With some $required fields, Only required field's value shall be displayed", function() {
        var expectedValue = "One, Three";
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.add({
            $required: true,
            $value: "One",
            toString: function () {
                return this.$value;
            }
        });
        resource.add({
            $required: false,
            $value: "Two",
            toString: function () {
                return this.$value;
            }
        });
        resource.add({
            $required: true,
            $value: "Three",
            toString: function () {
                return this.$value;
            }
        });
        expect(resource.toString()).toEqual(expectedValue);
        expect('' + resource).toEqual(expectedValue);
    });

    it("[toString] With no $required fields, All field's value shall be displayed", function() {
        var expectedValue = "One, Two, Three";
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource.add({
            $required: false,
            $value: "One",
            toString: function () {
                return this.$value;
            }
        });
        resource.add({
            $value: "Two",
            toString: function () {
                return this.$value;
            }
        });
        resource.add({
            $value: "Three",
            toString: function () {
                return this.$value;
            }
        });
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
        resource.$selfUpdated = true;
        resource.reset();
        expect(resource.$selfUpdated).toBe(false);
    });

    it("[hasCreated] Shall return true as pkName is not set", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource._id = undefined;
        expect(resource.hasCreated()).toBe(true);
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
        // FIXME: shall be 3 ??
        expect(resource.count()).toEqual(4);
        expect(resource.hasUpdated()).toBe(true);
    });

    it("[selfCommit] Shall set $selfUpdated to false", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        var callCount = 0;
        var child1 = {
            $selfUpdated: true,
            selfCommit: function () {
                callCount++;
            }
        };
        var child2 = {
            $selfUpdated: true,
            selfCommit: function () {
                callCount++;
            }
        };
        var child3 = {
            $selfUpdated: true,
            selfCommit: function () {
                callCount++;
            }
        };
        var children = [child1, child2, child3];
        children.forEach(function (child) {
            resource.add(child);
        });
        resource.selfCommit();
        expect(callCount).toEqual(children.length);
        children.forEach(function (child) {
            expect(child.$selfUpdated).toBe(false);
        });
    });

    it("[selfUpdate] Shall update accordingly", function() {
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests);
        resource._id = "Shall.be.overridden";
        resource.testing = undefined;
        var update = {
            _id: "An ID value",
            testing: "A testing value to be set",
            $value: "Shall be mapped"
        };
        resource.selfUpdate(update);
        expect(resource._id).toEqual(update._id);
        expect(resource.$value).toEqual(update.$value);
    });

    it("[load] Shall load from given Object (Resource) - LIST", function() {

        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            test: ["One", "Ready"]
        };

        resourceObject._id = _id;
        resourceObject._etag = _etag;
        var resource = _createResource(undefined, 'test', DEFAULT_SCHEMAS.tests, resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        expect(resource.toString()).toEqual("One, Ready");
    });

    it("[load] Shall load from given Object (Resource) - DICT with schema", function() {

        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            test: {
                lastname: "TEST",
                firstname: "Test"
            }
        };
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'dict',
                schema: {
                    lastname: { type: "string" },
                    firstname: { type: "string" }
                }
            }
        }, resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        expect(resource.$components[0].toString()).toEqual("TEST, Test");
    });

    it("[load] Shall load from given Object (Resource) - DICT without schema", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'dict'
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            test: {
                lastname: "TEST",
                firstname: "Test"
            }
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyNestedField).toBe(true);
        expect(child.$components[0] instanceof ApyPolyField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - POINT", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'point'
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            test: {"type":"Point","coordinates":[1.2678,-1.6579]}
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyPointField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - MEDIA", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'media'
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            imageTest: {
                "content_type":"image/png",
                "file": "https://media.tests.fr/0123456789",
                name: "a-test-image.png"
            }
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyMediaField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - FLOAT", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'float',
                default: 1.0
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            coefficient: 2.5
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyNumberField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - NUMBER", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'number',
                default: 1.0
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            coefficient: 2.5
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyNumberField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - INTEGER", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'float',
                default: 2
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            coefficient: 5
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyNumberField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - BOOLEAN", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'boolean',
                default: true
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            coefficient: 5
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyBooleanField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - DATETIME", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'datetime',
                default: new Date()
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            event: new Date()
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyDatetimeField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - OBJECTID", function() {
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'objectid',
                default: "0123456789",
                data_relation: {
                    resource: "parents"
                }
            }
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            parent: _id + _etag
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyEmbeddedField).toBe(true);
    });

    it("[load] Shall load from given Object (Resource) - NO TYPE", function() {
        var resource = _createResource(undefined, 'test', {
            test: {}
        });
        var _id = "0123456789";
        var _etag = "9876543210";
        var resourceObject = {
            _id: _id,
            _etag: _etag,
            parent: _id + _etag
        };
        resource.load(resourceObject);
        expect(resource._id).toEqual(_id);
        expect(resource._etag).toEqual(_etag);
        var child = resource.$components[0];
        expect(child instanceof ApyPolyField).toBe(true);
    });

    it("[cleanedData] Shall return a well-formed Object mirroring inner components state", function() {
        var count = 3;
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'list',
                default: "0123456789",
                data_relation: {
                    resource: "parents"
                }
            }
        });
        for(var i=0; i<count; i++) {
            resource.add({
                $name: "name" + i,
                $type: "string",
                $value: "Incremental " + i,
                cleanedData: function () {
                    return this.$value;
                }
            });
        }
        resource.add({
            _id: "01234567889",
            $name: "parent",
            $type: "objectid",
            cleanedData: function () {
                return this._id;
            }
        });

        var expectedData = {
            test: [],
            name0: "Incremental 0",
            name1: "Incremental 1",
            name2: "Incremental 2",
            parent: "01234567889"

        };
        expect(resource.cleanedData()).toEqual(expectedData);
    });

    it("[isReadOnly] Shall return true as all components held are `readOnly`", function() {
        var count = 3;
        var resource = _createResource(undefined, 'test', {
            test: {}
        });
        for(var i=0; i<count; i++) {
            resource.add({
                readOnly: true
            });
        }
        expect(resource.isReadOnly()).toBe(true);
    });

    it("[isReadOnly] Shall return false as only some components held are `readOnly`", function() {
        var count = 3;
        var resource = _createResource(undefined, 'test', {
            test: {
                type: 'objectid',
                default: "0123456789",
                data_relation: {
                    resource: "parents"
                }
            }
        });
        for(var i=0; i<count; i++) {
            resource.add({
                readOnly: true
            });
        }
        resource.add({
            readOnly: false
        });
        expect(resource.isReadOnly()).toBe(false);
    });

});