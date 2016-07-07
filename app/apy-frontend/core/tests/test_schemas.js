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
 *  Schemas UTs
 *
 *  """
 */

describe("Core.schemas unit tests", function() {
    var DEFAULT_CONFIG = {};
    var DEFAULT_SCHEMAS = {
        test: {type: 'list'}
    };
    var DEFAULT_ENDPOINT = 'http://localhost/';

    // Mocked Objects

    // Mocked Service
    var Service = function () {
        this.$log = console;
        this.$schemas = null;
        this.$instance = null;
    };

    var _createSchemasComponent = function (endpoint, schemas, config) {
        var service = new Service();
        var schemasObj = new ApySchemasComponent(endpoint || DEFAULT_ENDPOINT,
            schemas || DEFAULT_SCHEMAS, config || DEFAULT_CONFIG, service);
        service.$instance = schemasObj;
        service.$schemas = schemasObj.$componentArray;
        return schemasObj
    };

    it("[get] No Schema's name is provided - An Error shall be thrown", function () {
        var name = undefined;
        var resource = {};
        var component = _createSchemasComponent();
        var wrapper = function() {
            component.createResource(name, resource);
        };
        expect(wrapper).toThrow(new Error('Unknown schema name, undefined'));
    });

    it("[createResource] No Service object provided - An Error shall be thrown", function () {
        var wrapper = function() {
            new ApySchemasComponent(DEFAULT_ENDPOINT, DEFAULT_SCHEMAS, DEFAULT_CONFIG);
        };
        expect(wrapper).toThrow(new Error('A Service object must be provided (got type => undefined) !'));
    });

    it("[createResource] No Schemas object provided - An Error shall be thrown", function () {
        var wrapper = function() {
            new ApySchemasComponent(DEFAULT_ENDPOINT, undefined, DEFAULT_CONFIG, new Service());
        };
        expect(wrapper).toThrow(new Error('A schemas object must be provided (got type => undefined) !'));
    });

    it("[createResource] An `ApyResourceComponent` shall be created", function () {
        var name = 'test';
        var resource = {};
        var component = _createSchemasComponent();
        var resourceInstance = component.createResource(name, resource);
        expect(resourceInstance instanceof ApyResourceComponent).toBe(true);
    });

    it("[createResource] An `ApyResourceComponent` shall be created with given parameters", function () {
        var name = 'test';
        var resource = {test: [1, 2, 3]};
        var component = _createSchemasComponent();
        var resourceInstance = component.createResource(name, resource);
        expect(resourceInstance.$components.length).toEqual(1);
    });
});