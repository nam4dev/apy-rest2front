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
 *  Core UTs
 *
 *  """
 */
describe("Core.core unit tests", function() {
    it("[loadSchemas] Shall load schemas asynchronously", function () {
        var schemaName = 'tests';
        var endpoint = 'https://www.tests.fr/';
        var service = apy.tests.createService();
        service.initEndpoints(endpoint, schemaName);
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
            response: JSON.stringify(apy.tests.DEFAULT_SCHEMAS)
        };
        service.loadSchemas(false);
        expect(service.$instance instanceof apy.tests.$types.components.Schemas).toBe(true);
        expect(service.$schemas).toEqual(service.$instance.$components);
        expect(service.$schemasAsArray).toEqual(service.$instance.$componentArray);
    });

    it("[initEndpoints] Endpoints shall be set properly", function () {
        var schemaName = 'tests';
        var endpoint = 'https://www.tests.fr/';
        var service = apy.tests.createService();
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
        var service = apy.tests.createService();
        service.setDependencies(deps[0], deps[1], deps[2]);
        expect(service.$log).toEqual(deps[0].value);
        expect(service.$http).toEqual(deps[1].value);
        expect(service.$upload).toEqual(deps[2].value);
    });

    it("[createCollection] Shall create an Collection instance", function () {
        var schemaName = 'tests';
        var service = apy.tests.createService();
        var collection = service.createCollection(schemaName);
        expect(collection instanceof apy.tests.$types.components.Collection).toBe(true);
    });
});