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
 *  AngularJs Integration Generic View UTs
 *
 *  """
 */

describe("ApyViewCtrl", function() {

    var $controller;
    beforeEach(module('apy-frontend.view'));
    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    var createContext = function (controllerName, currentRouteName) {
        var $log = { log: function () {} };
        var $http = {};
        var Upload = {};
        var config = {
            pkName: '_id',
            appTheme: 'bootstrap3',
            excludedEndpointByNames: ['logs'],
            schemas: {}
        };
        var schemaName = "tests";
        var endpoint = "https://www.tests.fr/";
        var provider = new ApyCompositeService($log, $http, Upload, config);
        // Mocking XmlHttpRequest object
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
        provider.initEndpoints(endpoint, schemaName)
            .loadSchemas();

        var $context = {};
        $context.$scope = {};
        $context.$rootScope = {};
        $context.$modalContext = {};
        $context.$modalCalled = false;
        $context.$modalDismissCalled = false;
        $context.$controller = $controller(controllerName, {
            $rootScope: $context.$rootScope,
            $scope: $context.$scope,
            $log: $log,
            $route: {
                current: {
                    name: currentRouteName
                }
            },
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
            Upload: Upload,
            apy: provider
        });

        $context.$scope.$collection.fetch = function () {
            return {
                then: function () {

                }
            }
        };
        return $context;
    };

    describe('$scope.displayError', function() {
        it("Shall display error in a Modal", function() {
            var error = "a test error";
            var $context = createContext('ApyViewCtrl', "tests");
            $context.$scope.displayError(error);
            $context.$scope.ok();
            expect($context.$modalContext).toEqual({
                animation: true,
                templateUrl: 'modal-error.html',
                controllerAs: 'ModalCtrl',
                scope: $context.$scope
            });
            expect($context.$scope.error).toEqual(error);
            expect($context.$modalCalled).toBe(true);
            expect($context.$modalDismissCalled).toBe(true);
        });
    });

    describe('$scope.createResource', function() {
        it("Shall append a created Resource instance to the Collection", function() {
            var $context = createContext('ApyViewCtrl', "tests");
            expect($context.$scope.$collection.count()).toEqual(0);
            $context.$scope.createResource();
            expect($context.$scope.$collection.count()).toEqual(1);
        });
    });

    describe('$scope.updateResource', function() {
        it("Shall update Resource inner state ($STATES.UPDATE)", function() {
            var $context = createContext('ApyViewCtrl', "tests");
            expect($context.$scope.$collection.count()).toEqual(0);
            $context.$scope.createResource();
            var resource = $context.$scope.$collection.getChild(0);
            expect(resource.$states.$current).toEqual('CREATE');
            $context.$scope.updateResource(resource);
            expect(resource.$states.$current).toEqual('UPDATE');
        });
    });

    describe('$scope.removeResource', function() {
        it("Shall remove Resource from Collection", function() {
            var $context = createContext('ApyViewCtrl', "tests");
            $context.$scope.createResource();
            expect($context.$scope.$collection.count()).toEqual(1);
            var resource = $context.$scope.$collection.getChild(0);
            // FIXME: All tests are passed but huge trace follows
            $context.$scope.removeResource(resource);
            expect($context.$scope.$collection.count()).toEqual(0);
        });
    });

    describe('$scope.updateResources', function() {
        it("Shall update Resource inner state ($STATES.UPDATE) of the whole Collection", function() {
            var count = 5;
            var $context = createContext('ApyViewCtrl', "tests");
            var components = $context.$scope.$collection.$components;
            for(var i=0; i<count; i++) {
                $context.$scope.createResource();
            }
            expect($context.$scope.$collection.count()).toEqual(count);
            components.forEach(function (comp) {
                expect(comp.$states.$current).toEqual('CREATE');
            });
            $context.$scope.updateResources();
            components.forEach(function (comp) {
                expect(comp.$states.$current).toEqual('UPDATE');
            });
        });
    });

    describe('$scope.deleteResources', function() {
        it("Shall ask not delete all Resources contained in the Collection when cancel is clicked", function() {
            var count = 5;
            var $context = createContext('ApyViewCtrl', "tests");
            for(var i=0; i<count; i++) {
                $context.$scope.createResource();
            }
            var collection = $context.$scope.$collection;
            expect(collection.count()).toEqual(count);
            $context.$scope.deleteResources();
            $context.$scope.cancel();
            expect(collection.count()).toEqual(count);
        });
    });

    describe('$scope.deleteResources', function() {
        it("Shall ask delete all Resources contained in the Collection when ok is clicked", function() {
            var count = 5;
            var $context = createContext('ApyViewCtrl', "tests");
            for(var i=0; i<count; i++) {
                $context.$scope.createResource();
            }
            var collection = $context.$scope.$collection;
            var expectedCount = collection.count();
            var expectedAction = "Delete";
            var expectedMessage = "Would you really like to delete " + expectedCount + " listed resources ?";
            expect(collection.count()).toEqual(count);
            $context.$scope.deleteResources();
            $context.$scope.ok();
            expect(collection.count()).toEqual(0);
            expect($context.$scope.action).toEqual(expectedAction);
            expect($context.$scope.message).toEqual(expectedMessage);
        });
    });

    describe('$scope.read', function() {
        it("Shall set all the collection's items into 'READ' state", function() {
            var count = 5;
            var $context = createContext('ApyViewCtrl', "tests");
            for(var i=0; i<count; i++) {
                $context.$scope.createResource();
            }
            var collection = $context.$scope.$collection;
            $context.$scope.read();
            collection.$components.forEach(function (comp) {
                expect(comp.$states.$current).toEqual('READ');
            });
            expect($context.$scope.updateHidden).toBe(false);
            expect($context.$scope.validateHidden).toBe(true);
        });
    });

});