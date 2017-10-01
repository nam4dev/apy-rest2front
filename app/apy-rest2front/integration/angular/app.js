/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy REST2Front.
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
 *  `apy-rest2front`  Copyright (C) 2016 Namgyal Brisson.
 *
 *  """
 *  Angular CRUD Panel integration starting point
 *
 *  """
 */
/* istanbul ignore next */
(function(angular, $apy) {'use strict';

    var customSettings = $apy.customSettings || {};
    var settings = $apy.settings.create(customSettings);
    // Alias
    var auth = settings.authentication;

    var app = $apy.integration.app = angular.module('apy-rest2front', [
        'ngRoute',
        'ngAnimate',
        'ngFileUpload',
        'ui.bootstrap',
        'angular.backtop',
        'monospaced.elastic',
        'apy-rest2front.view',
        'apy-rest2front.version'
    ])
        .provider('apyModal', function apyModalProvider() {
            this.$get = function apyModalFactory() {
                var $injector = angular.injector(['ng', 'ui.bootstrap']),
                    $uibModal = $injector.get('$uibModal');
                return new $apy.integration.angular.ApyModalProxy($injector.get('$rootScope'), $uibModal);
            };
        })
        .provider('apy', function apyProvider() {
            this.$get = function apyFactory() {
                return new $apy.CompositeService();
            };
        })
        .config(['$routeProvider', function($routeProvider) {
            if (auth.isEnabled()) {
                // Auth route
                $routeProvider.when('/signin', {
                    templateUrl: settings.getViewByName('signin'),
                    controller: 'apySignInCtrl'
                });
            }
            // setting a generic parameter 'resource'
            $routeProvider.when('/:resource', {
                templateUrl: settings.getViewByName('view'),
                controller: 'apyViewCtrl'
            })
            // default route
                .otherwise({redirectTo: 'index'});
        }])
        .controller('indexCtrl', ['$scope', 'apy', '$location', function($scope, apyProvider, $location) {

            $scope.apyTick = '' + parseInt(new Date().getTime());

            if (auth.isEnabled()) {
                $scope.$watch(function() {
                    return apyProvider.isAuthenticated(function () {
                        return settings.authentication.isAuthenticated();
                    });
                }, function(value, oldValue) {
                    if (!value && oldValue) {
                        // console.log("Disconnect");
                        $location.path('/signin');
                    }

                    if (value) {
                        // console.log("Connect");
                        $location.path('/index');
                    }
                }, true);
            }
        }]);

    if (auth.isEnabled()) {
        app.run(['$rootScope', '$location', 'apy', function($rootScope, $location, apyProvider) {
            $rootScope.$on('$routeChangeStart', function() {
                if (!apyProvider.isAuthenticated(function () {
                        return settings.authentication.isAuthenticated();
                    })) {
                    $location.path('/signin');
                }
            });
        }]);
    }
})(window.angular, apy);
