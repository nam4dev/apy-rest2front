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
 *  Schemas UTs
 *
 *  """
 */

describe("Core.schemas unit tests", function() {
    var DEFAULT_CONFIG = apy.tests.DEFAULT_CONFIG;
    var DEFAULT_SCHEMAS = apy.tests.DEFAULT_SCHEMAS;
    var DEFAULT_ENDPOINT = apy.tests.DEFAULT_ENDPOINT;

    it("[get] No Schema's name is provided - An Error shall be thrown", function () {
        var name = undefined;
        var resource = {};
        var component = apy.tests.createSchemasComponent();
        var wrapper = function() {
            component.createResource(name, resource);
        };
        expect(wrapper).toThrow(new apy.tests.$types.errors.Error('Unknown schema name, undefined'));
    });

    it("[createResource] No Service object provided - An Error shall be thrown", function () {
        var wrapper = function() {
            new apy.tests.$types.components.Schemas(DEFAULT_ENDPOINT, DEFAULT_SCHEMAS, DEFAULT_CONFIG);
        };
        expect(wrapper).toThrow(new apy.tests.$types.errors.Error('A Service object must be provided (got type => undefined) !'));
    });

    it("[createResource] No Schemas object provided - An Error shall be thrown", function () {
        var wrapper = function() {
            new apy.tests.$types.components.Schemas(DEFAULT_ENDPOINT, undefined, DEFAULT_CONFIG, apy.tests.createService());
        };
        expect(wrapper).toThrow(new apy.tests.$types.errors.Error('A schemas object must be provided (got type => undefined) !'));
    });

    it("[createResource] An `Resource` shall be created", function () {
        var name = 'tests';
        var resource = {};
        var component = apy.tests.createSchemasComponent();
        var resourceInstance = component.createResource(name, resource);
        expect(resourceInstance instanceof apy.tests.$types.components.Resource).toBe(true);
    });

    it("[createResource] An `Resource` shall be created with given parameters", function () {
        var name = 'tests';
        var resource = {test: [1, 2, 3]};
        var component = apy.tests.createSchemasComponent();
        var resourceInstance = component.createResource(name, resource);
        expect(resourceInstance.$components.length).toEqual(1);
    });

    it("[transformData] Case $TYPES.LIST - No schema provided - shall return an empty Array", function () {
        var expectedResult = [];
        var result = apy.tests.createSchemasComponent().transformData("", {type: apy.helpers.$TYPES.LIST});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.LIST - Schema provided - shall return an non-empty Array", function () {
        var expectedResult = [""];
        var result = apy.tests.createSchemasComponent().transformData("", {type: apy.helpers.$TYPES.LIST, schema: {
            type: apy.helpers.$TYPES.STRING,
            required: true
        }});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.DICT - shall return an Object", function () {
        var expectedResult = {
            test: "",
            testList: [],
            innerDict: {
                reallyNested: ""
            }
        };
        var result = apy.tests.createSchemasComponent().transformData("", {type: apy.helpers.$TYPES.DICT, schema: {
            test: { type: apy.helpers.$TYPES.STRING },
            testList: { type: apy.helpers.$TYPES.LIST },
            innerDict: {
                type: apy.helpers.$TYPES.DICT,
                schema: {
                    reallyNested: { type: apy.helpers.$TYPES.STRING }
                }
            }
        }});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.FLOAT - shall return decimal 0.0", function () {
        var expectedResult = 0.0;
        var result = apy.tests.createSchemasComponent().transformData("", {type: apy.helpers.$TYPES.FLOAT});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.NUMBER - shall return decimal 0.0", function () {
        var expectedResult = 0.0;
        var result = apy.tests.createSchemasComponent().transformData("", {type: apy.helpers.$TYPES.NUMBER});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.INTEGER - shall return integer 0", function () {
        var expectedResult = 0;
        var result = apy.tests.createSchemasComponent().transformData("", {type: apy.helpers.$TYPES.INTEGER});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.BOOLEAN - shall return a boolean to default value (true)", function () {
        var expectedResult = true;
        var result = apy.tests.createSchemasComponent().transformData("", {type: apy.helpers.$TYPES.BOOLEAN, default: true});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.OBJECTID with prefixed `_` keyName - shall return an empty string", function () {
        var expectedResult = "";
        var result = apy.tests.createSchemasComponent().transformData("_test", {type: apy.helpers.$TYPES.OBJECTID});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.OBJECTID with non-prefixed `_` keyName - shall return matching data relation mapped data (based on schema)", function () {
        var expectedResult = {test: []};
        var schemas = apy.tests.createSchemasComponent();
        var result = schemas.transformData("test", {type: apy.helpers.$TYPES.OBJECTID, data_relation: {resource: "tests"}});
        expect(result).toEqual(expectedResult);
    });

    it("[transformData] Case $TYPES.DATETIME - shall return a Date object (no default provided)", function () {
        var result = apy.tests.createSchemasComponent().transformData("test", {type: apy.helpers.$TYPES.DATETIME});
        expect(result instanceof Date).toBe(true);
    });

    it("[transformData] Case $TYPES.DATETIME - shall return a Date object (no default provided)", function () {
        var expectedResult = new Date();
        var result = apy.tests.createSchemasComponent().transformData("test", {type: apy.helpers.$TYPES.DATETIME, default: expectedResult.toUTCString()});
        expect(result instanceof Date).toBe(true);
        expect(result.toUTCString()).toEqual(expectedResult.toUTCString());
    });
});