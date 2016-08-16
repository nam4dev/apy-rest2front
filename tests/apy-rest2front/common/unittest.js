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
 *  One place for common UT snippets
 *  Mocking Main library components
 *
 *  """
 */

(function ($window) {

    if(!$window.apy) {
        $window.apy = {};
    }
    if(!$window.apy.config) {
        $window.apy.config = {
            debug: false
        };
    }
    if(!$window.apy.tests) {
        $window.apy.tests = {};
    }

    var DEFAULT_SCHEMAS = {};
    var DEFAULT_SCHEMA_NAME = 'tests';
    var DEFAULT_ENDPOINT = 'https://www.tests.fr/';
    var DEFAULT_CONFIG = {
        schemas: {},
        pkName: '_id',
        auth: {
            enabled: false
        },
        appTheme: 'bootstrap3',
        endpoint: DEFAULT_ENDPOINT,
        schemasEndpointName: DEFAULT_SCHEMA_NAME,
        excludedEndpointByNames: ['logs']
    };
    DEFAULT_SCHEMAS[DEFAULT_SCHEMA_NAME] = {type: 'list'};

    function NetMock() {
        function stubbed() {}
        if(apy.config.debug) {
            console.log(arguments);
            return {
                then: console.log,
                catch: console.warn
            }
        }
        else {
            return {
                then: stubbed,
                catch: stubbed
            }
        }
    }

    function _createService(config, $log, $http, $upload) {
        $log = $log || {};
        $http = $http || NetMock();
        $upload = $upload || { upload: NetMock() };
        var service = new apy.tests.$types.CompositeService($log, $http, $upload, config || DEFAULT_CONFIG);
        service.setSchemas(DEFAULT_SCHEMAS);
        return service;
    }

    var _createSchemasComponent = function () {
        var service = apy.tests.createService();
        return service.$instance;
    };

    var _createFieldByType = function (type, value, schema, config) {
        schema = schema || {};
        schema.type = type;
        var fieldClass = apy.helpers.fieldClassByType(type);
        return new fieldClass(_createService(config), type, schema, value);
    };

    // Helpers
    function HelperTypesFactory() {
        return {
            createPoint: function (params) {
                // {coordinates: [0.0, 1.0]}
                return new apy.tests.$types.Point(params);
            },
            createMediaFile: function (value, endpoint) {
                return new apy.tests.$types.MediaFile(endpoint || DEFAULT_ENDPOINT, value);
            }
        }
    }

    // Helper references
    $window.apy.tests.helper = {
        isDate: apy.helpers.isDate,
        isFunction: apy.helpers.isFunction
    };

    // Type references (instanceof)
    $window.apy.tests.$types = {
        Point: apy.helpers.GeoPoint,
        MediaFile: apy.helpers.MediaFile,
        CompositeService: apy.CompositeService,
        components: {
            Schema: apy.components.Schema,
            Schemas: apy.components.Schemas,
            Resource: apy.components.Resource,
            Collection: apy.components.Collection,
            Component: apy.components.ComponentMixin,
            fields: {
                List: apy.components.fields.List,
                Poly: apy.components.fields.Poly,
                Field: apy.components.fields.FieldMixin,
                Media: apy.components.fields.Media,
                Nested: apy.components.fields.Nested,
                Number: apy.components.fields.Number,
                String: apy.components.fields.String,
                Boolean: apy.components.fields.Boolean,
                Datetime: apy.components.fields.Datetime,
                Embedded: apy.components.fields.Embedded,
                geo: {
                    Point: apy.components.fields.geo.Point
                }
            }
        }
    };

    // constants
    $window.apy.tests.DEFAULT_CONFIG = DEFAULT_CONFIG;
    $window.apy.tests.DEFAULT_SCHEMAS = DEFAULT_SCHEMAS;
    $window.apy.tests.DEFAULT_ENDPOINT = DEFAULT_ENDPOINT;
    $window.apy.tests.DEFAULT_SCHEMA_NAME = DEFAULT_SCHEMA_NAME;

    // methods
    $window.apy.tests.createService = _createService;
    $window.apy.tests.factory = new HelperTypesFactory();
    $window.apy.tests.createFieldByType = _createFieldByType;
    $window.apy.tests.createSchemasComponent = _createSchemasComponent;

})(window);
