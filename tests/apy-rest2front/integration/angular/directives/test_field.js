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
 *  AngularJs Integration Generic View.Field directive UTs
 *
 *  """
 */

describe("ApyFieldCtrl", function() {

    var $controller, context;
    beforeEach(module('apy-rest2front.view'));
    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
        context = createContext("ApyFieldCtrl");
    }));

    var createContext = function (controllerName) {
        var $log = { log: function () {} };
        var $http = {};
        var Upload = {};
        var config = {
            pkName: '_id',
            appTheme: 'bootstrap3',
            schemasEndpointName: "tests",
            endpoint: "https://www.tests.fr/",
            excludedEndpointByNames: ['logs'],
            schemas: {}
        };
        var schemaName = "tests";
        var endpoint = "https://www.tests.fr/";
        var provider = new apy.tests.$types.CompositeService($log, $http, Upload, config);
        // Mocking XmlHttpRequest object
        provider.fetch = function () {
            return {
                then: function () {

                },
                catch: function () {

                }
            }
        };
        provider.$syncHttp = {
            open: function () {

            },
            send: function () {

            },
            response: JSON.stringify({
                tests: {
                    _id: {
                        unique: true,
                        type: "objectid"
                    },
                    description: {
                        type: "string"
                    },
                    title: {
                        type: "string"
                    }
                }})
        };
        // FIXME Update test settings behavior to fit the need
        //service.initEndpoints(endpoint, schemaName);
        // FIXME Quick workaround for now (2 lines)
        provider.$endpoint = endpoint;
        provider.$schemasEndpoint = schemaName;
        provider.loadSchemas(false);

        var $context = {};
        $context.$scope = {};
        $context.$modalContext = {};
        $context.$modalCalled = false;
        $context.$modalDismissCalled = false;
        $context.$modal = new apyModal($context);
        $context.$controller = $controller(controllerName, {
            $scope: $context.$scope,
            $log: $log,
            $uibModal: {
                open: function (context) {
                    $context.$modalContext = context;
                    $context.$modalCalled = true;
                    return {
                        dismiss: function () {
                            $context.$modalDismissCalled = true;
                        }
                    }
                }
            },
            apy: provider,
            apyModal: $context.$modal
        });

        return $context;
    };

    describe('$scope.displayChoices', function() {
        it("Shall display Schema names as Choices", function() {
            expect($controller).toBeTruthy();
            expect($controller).toBeDefined();
            expect(context).toBeDefined();
            expect(context.$scope).toBeDefined();

            context.$scope.displayChoices();
            expect(context.$scope.displaySchemaNames).toBe(true);
        })
    });

    describe('$scope.hideChoices', function() {
        it("Shall hide Schema names as Choices", function() {
            expect($controller).toBeTruthy();
            expect($controller).toBeDefined();
            expect(context).toBeDefined();
            expect(context.$scope).toBeDefined();

            context.$scope.hideChoices();
            expect(context.$scope.displaySchemaNames).toBe(false);
        })
    });

    describe('$scope.expandList', function() {
        it("Open a Modal and call oneMore method (empty components)", function() {
            expect($controller).toBeTruthy();
            expect($controller).toBeDefined();
            expect(context).toBeDefined();
            expect(context.$scope).toBeDefined();
            // Mocking Field instance
            var oneMoreCalled = false;
            var field = {
                count: function () {
                    return false;
                },
                oneMore: function () {
                    oneMoreCalled = true;
                }
            };
            context.$scope.expandList(field);
            expect(oneMoreCalled).toBe(true);
            expect(context.$modalCalled).toBe(true);
            context.$scope.ok();
            expect(context.$modalDismissCalled).toBe(true);
            context.$modalDismissCalled = false;
            context.$scope.cancel();
            expect(context.$modalDismissCalled).toBe(true);
        })
    });

    describe('$scope.expandRecursive', function() {
        it("Open a Modal and set ok / cancel callbacks", function() {
            expect($controller).toBeTruthy();
            expect($controller).toBeDefined();
            expect(context).toBeDefined();
            expect(context.$scope).toBeDefined();
            // Mocking Field instance
            var resetCalled = false;
            var field = {
                reset: function () {
                    resetCalled = true;
                }
            };
            context.$scope.expandRecursive(field);

            expect(context.$modalCalled).toBe(true);
            context.$scope.ok();
            expect(context.$modalDismissCalled).toBe(true);

            context.$modalDismissCalled = false;

            context.$scope.cancel();
            expect(resetCalled).toBe(true);
            expect(context.$modalDismissCalled).toBe(true);
        })
    });
});