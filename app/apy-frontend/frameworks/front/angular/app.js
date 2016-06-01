/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy Frontend.
 *  For UI components (data representation & bindings), AngularJs is used.
 *  Anyhow, the framework is intended to be plugged to any UI or Backend framework...
 *
 *  Copyright (C) 2016 Namgyal Brisson
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
 *  `apy-frontend`  Copyright (C) 2016 Namgyal Brisson.
 *
 *  """
 *  Angular integration starter
 *
 *  """
 */
(function (angular) {'use strict';

    var endpoint = 'http://localhost:8001/',
    //var endpoint = 'http://wishlist.apy-consulting.com:8000/',
        schemaName = 'schemas',
        appTheme = 'bootstrap3',
        application = angular.module('apy', [
            'ngRoute',
            'ngAnimate',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.tree',
            'apy.view',
            'apy.version'
        ]),
        schemas;

    application.provider("apy", function apyProvider () {
        this.$get = function apyFactory () {
            var $injector = angular.injector(['ng', 'ngFileUpload']),
                $log = $injector.get('$log'),
                $http = $injector.get('$http'),
                Upload = $injector.get('Upload'),
                config = {
                    pkName: '_id',
                    appTheme: appTheme,
                    excludedEndpointByNames: ['logs']
                };
            return new ApyCompositeService($log, $http, Upload, config);
        };
    });

    application.config(['$routeProvider', 'apyProvider', function($routeProvider, apyProvider) {
        // Getting an apyProvider instance
        var provider = apyProvider.$get()
            .initEndpoints(endpoint, schemaName)
            .loadSchemas();

        var schemasAsArray = provider.$schemasAsArray;
        schemas = provider.$schemas;
        // setting each schema's route
        angular.forEach(schemasAsArray, function (schema) {
            $routeProvider.when(schema.route, {
                templateUrl: 'apy-frontend/frameworks/front/angular/view.html',
                controller: 'ApyViewCtrl',
                name: schema.name
            });
        });
        // setting index route
        $routeProvider.when('/index', {
            controller: 'IndexCtrl',
            name: 'index'
        });
        // default route
        $routeProvider.otherwise({redirectTo: 'index'});
    }]);

    application.controller('IndexCtrl', ['$scope', '$log', '$route', 'apy', 'Upload',
        function ($scope, $log, $route, apyProvider, Upload) {
            apyProvider.initEndpoints(endpoint, schemaName).setDependencies(
                {name: "Upload", value: Upload}
            ).setSchemas(schemas);
            $scope.$schemas = apyProvider.$schemasAsArray;
            $scope.$route = $route;
        }]);

    application.directive('apyNavigation', [function () {
        return {
            template: '<ul class="nav navbar-nav">' +
            '<li ng-repeat="schema in $schemas" ng-if="!schema.hidden">' +
            '<a href="#/{{ schema.name }}">' +
            '<span class="text-capitalize">' +
            '<strong>{{ schema.humanName || schema.name }}</strong>' +
            '</span>' +
            '</a>' +
            '</li>' +
            '</ul>'
        };
    }]);

})(window.angular);
