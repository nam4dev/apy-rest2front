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
            .loadSchemas(false);

        var $context = {};
        $context.$scope = {
            $apply: function () {}
        };
        $context.$rootScope = {};
        $context.$modalContext = {};
        $context.$modalCalled = false;
        $context.$modal = new apyModal($context);
        $context.$controller = $controller(controllerName, {
            $rootScope: $context.$rootScope,
            $scope: $context.$scope,
            $log: $log,
            $routeParams: {
                resource: currentRouteName
            },
            apyModal: $context.$modal,
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

    describe('$scope.deleteResources', function() {
        it("Shall ask not delete all Resources contained in the Collection when cancel is clicked", function() {
            var count = 5;
            var $context = createContext('apyViewCtrl', "tests");
            for(var i=0; i<count; i++) {
                $context.$scope.$collection.createResource();
            }
            var collection = $context.$scope.$collection;
            expect(collection.count()).toEqual(count);
            $context.$scope.deleteResources();
            $context.$modal.cancel();
            expect(collection.count()).toEqual(count);
        });
    });

    describe('$scope.deleteResources', function() {
        it("Shall ask delete all Resources contained in the Collection when ok is clicked", function() {
            var count = 5;
            var $context = createContext('apyViewCtrl', "tests");
            for(var i=0; i<count; i++) {
                $context.$scope.$collection.createResource();
            }
            var collection = $context.$scope.$collection;
            expect(collection.count()).toEqual(count);
            $context.$scope.deleteResources();
            $context.$modal.ok();
            expect(collection.count()).toEqual(0);
        });
    });
});