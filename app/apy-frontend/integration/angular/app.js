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
 *  Angular CRUD Panel integration starting point
 *
 *  """
 */
/* istanbul ignore next */
(function (angular) {'use strict';

    var appTheme = 'bootstrap3';
    angular.module('apy-frontend', [
        'ngRoute',
        'ngAnimate',
        'ngFileUpload',
        'ui.bootstrap',
        'angular.backtop',
        'monospaced.elastic',
        'apy-frontend.view',
        'apy-frontend.version'
    ])
        .provider("apy", function apyProvider () {
            this.$get = function apyFactory () {
                var $injector = angular.injector(['ng', 'ngFileUpload']),
                    $log = $injector.get('$log'),
                    $http = $injector.get('$http'),
                    Upload = $injector.get('Upload'),
                    config = {
                        pkName: '_id',
                        appTheme: appTheme,
                        excludedEndpointByNames: ['logs'],
                        schemas: {}
                    };
                return new ApyCompositeService($log, $http, Upload, config);
            };
        })
        .config(['$httpProvider', '$routeProvider', function($httpProvider, $routeProvider) {
            // Intercept Unauthorized HTTP errors
            $httpProvider.interceptors.push(function($q) {
                return {
                    responseError: function(rejection) {
                        var defer = $q.defer();
                        if(rejection.status == 401) {
                            defer.reject(rejection);
                        }
                        return defer.promise;
                    }
                };
            });
            $routeProvider
                // setting a generic parameter 'resource'
                .when('/:resource', {
                    templateUrl: 'apy-frontend/integration/angular/view.html',
                    controller: 'ApyViewCtrl'
                })
                // default route
                .otherwise({redirectTo: 'index'});
        }])
        .controller('IndexCtrl', ['$scope', function ($scope) {}]);

})(window.angular);
