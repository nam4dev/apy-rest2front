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
 */
/**
 * One place for common UT snippets
 *
 * Mocking Main library components
 *
 * @namespace apy.tests
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
        endpoints: {
            definitions: DEFAULT_SCHEMA_NAME,
            root: {
                port: 80,
                hostname: DEFAULT_ENDPOINT
            }
        }
    };
    DEFAULT_SCHEMAS[DEFAULT_SCHEMA_NAME] = {type: 'list'};

    /**
     * Mock network-related Object such as `http`
     *
     * @class apy.tests.NetMock
     */
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

    /**
     * Create an `apy.CompositeService` instance
     *
     * @alias createService
     * @memberOf apy.tests
     *
     * @param {Object} settings Global application configuration object
     *
     * @return {apy.CompositeService} A CompositeService instance
     */
    function _createService(settings) {
        settings = settings || {};
        $http = settings.$http || NetMock();
        $upload = settings.$upload || { upload: NetMock() };
        var service = new apy.tests.$types.CompositeService(settings || DEFAULT_CONFIG);
        service.setSchemas(DEFAULT_SCHEMAS);
        return service;
    }

    /**
     * Create an `apy.components.Schemas` instance
     *
     * @alias createSchemasComponent
     * @memberOf apy.tests
     *
     * @return {apy.components.Schemas} A Schemas instance
     */
    var _createSchemasComponent = function () {
        var service = apy.tests.createService();
        return service.$instance;
    };

    /**
     * Create any Field instance based on given type
     *
     * @alias createFieldByType
     * @memberOf apy.tests
     *
     * @param {string} type Field's type
     * @param {*} value Field's value
     * @param {Object} schema Field's schema object
     * @param {Object} config Global application configuration object
     *
     * @returns {apy.components.fields} Any Field instance
     */
    var _createFieldByType = function (type, value, schema, config) {
        schema = schema || {};
        schema.type = type;
        var fieldClass = apy.helpers.fieldClassByType(type);
        return new fieldClass(_createService(config), type, schema, value);
    };

    /**
     * Types factory
     *
     * @class apy.tests.HelperTypesFactory
     */
    function HelperTypesFactory() {
        return {
            /**
             * Create a GeoPoint instance
             *
             * @memberOf apy.tests.HelperTypesFactory
             *
             * @param {Object|apy.helpers.GeoPoint} params An object representing a Point (x,y)
             *
             * @return {apy.helpers.GeoPoint} A GeoPoint instance
             */
            createPoint: function (params) {
                // {coordinates: [0.0, 1.0]}
                return new apy.tests.$types.Point(params);
            },
            /**
             * Create a MediaFile instance
             *
             * @memberOf apy.tests.HelperTypesFactory
             *
             * @param {string|Object} value A media file string or object
             * @param {string} endpoint REST API endpoint base
             *
             * @return {apy.helpers.MediaFile} A MediaFile instance
             */
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
        errors: {
            Error: apy.errors.Error,
            EveError: apy.errors.EveError,
            EveHTTPError: apy.errors.EveHTTPError
        },
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
    $window.apy.tests.settings = apy.settings;
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
