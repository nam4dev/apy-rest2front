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
 *  `apy-rest2front`  Copyright (C) 2016  (apy) Namgyal Brisson.
 */

describe("Core.errors.eve unit tests", function() {

    it("[EveError] Issue Array as input", function () {
        var issues = [
            'A fatal error',
            'yet another one'
        ];
        var error = new apy.tests.$types.errors.EveError(issues);

        expect(error.name).toBeDefined();
        expect(error.title).toBeDefined();
        expect(error.messages).toBeDefined();

        expect(error.title).toEqual('Error');
        expect(error.messages).toEqual(issues);
    });

    it("[EveError] Issue Object as input", function () {
        var fakeEveError = {
            data: {
                _error: {
                    code: '422'
                },
                _issues: {
                    name: 'Fatal test error name',
                    description: 'Fatal test error description'
                }
            }
        };
        var error = new apy.tests.$types.errors.EveError(fakeEveError);

        expect(error.name).toBeDefined();
        expect(error.title).toBeDefined();
        expect(error.messages).toBeDefined();

        expect(error.title).toEqual(fakeEveError.data._error.code);
        expect(error.messages).toEqual(fakeEveError.data._issues);
    });

    it("[EveError] Message Object as input", function () {
        var fakeEveError = {
            data: {
                _error: {
                    code: '422',
                    message: 'Fatal test error name'
                }
            }
        };
        var error = new apy.tests.$types.errors.EveError(fakeEveError);

        expect(error.name).toBeDefined();
        expect(error.title).toBeDefined();
        expect(error.messages).toBeDefined();

        expect(error.title).toEqual(fakeEveError.data._error.code + ': ' + fakeEveError.data._error.message);
        expect(error.messages).toEqual([fakeEveError.data._error.message]);
    });

    it("[EveError] Mal-formatted Object as input", function () {
        var fakeEveError = {
            data: {
                _error: {
                    code: '401'
                }
            }
        };
        var error = new apy.tests.$types.errors.EveError(fakeEveError);

        expect(error.name).toBeDefined();
        expect(error.title).toBeDefined();
        expect(error.messages).toBeDefined();

        expect(error.title).toEqual(fakeEveError.data._error.code);
        expect(error.messages).toEqual(['No details found!']);
    });

    it("[EveError] Error description only", function () {
        var fakeEveError = {
            data: {
                _error: {
                    message: "Unexpected Behavior"
                },
                error_description: 'Fatal test error description'
            }
        };
        var error = new apy.tests.$types.errors.EveError(fakeEveError);

        expect(error.name).toBeDefined();
        expect(error.title).toBeDefined();
        expect(error.messages).toBeDefined();

        expect(error.title).toEqual(fakeEveError.data._error.message);
        expect(error.messages).toEqual([
            fakeEveError.data.error_description,
            fakeEveError.data._error.message
        ]);
    });

    it("[EveHTTPError]", function () {
        var fakeEveError = {
            data: {
                _error: {
                    code: '401',
                    message: 'Unauthorized'
                },
                _issues: {
                    name: 'Fatal test error name',
                    description: 'Fatal test error description'
                }
            }
        };
        var error = new apy.tests.$types.errors.EveHTTPError(fakeEveError);

        expect(error.name).toBeDefined();
        expect(error.title).toBeDefined();
        expect(error.messages).toBeDefined();

        expect(error.title).toEqual(fakeEveError.data._error.code + ': ' + fakeEveError.data._error.message);
        expect(error.messages).toEqual(fakeEveError.data._issues);
    });

    it("[EveHTTPError]", function () {
        var fakeEveError = {
            status: 401,
            statusText: 'Unauthorized',
            _error: {
                code: 401,
                message: 'Invalid Credentials'
            }
        };
        var error = new apy.tests.$types.errors.EveHTTPError(fakeEveError);

        expect(error.name).toBeDefined();
        expect(error.title).toBeDefined();
        expect(error.messages).toBeDefined();

        expect(error.messages).toEqual([fakeEveError._error.message]);
        expect(error.title).toEqual(fakeEveError.status + ': ' + fakeEveError.statusText);
    });

});
