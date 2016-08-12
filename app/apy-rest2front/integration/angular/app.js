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
(function (angular, $globals) {'use strict';

    var config = {
        devOptions: {
            mode: false,
            htmlRoot: 'apy-rest2front/integration/angular/'
        },
        endpoint: 'http://localhost:8002/',
        schemasEndpointName: 'schemas',
        auth: {
            enabled: true,
            grant_type: 'password',
            endpoint: 'http://localhost:8002/oauth2/access',
            client_id: 'LB9wIXB5as4WCL1SUXyljgkSIR6l8H1kFEAHUQTH'
        },
        pkName: '_id',
        appTheme: 'bootstrap3',
        excludedEndpointByNames: ['logs'],
        schemas: {},
        $auth: function () {
            return (
                this.auth &&
                $globals.isObject(this.auth) &&
                this.auth.enabled &&
                this.auth.client_id &&
                this.auth.endpoint &&
                this.auth.grant_type
            );
        },
        viewPath: function (filename) {
            return ((this.devOptions.mode) ? this.devOptions.htmlRoot : '') + filename;
        }
    };

    var app = angular.module('apy-rest2front', [
        'ngRoute',
        'ngAnimate',
        'ngFileUpload',
        'ui.bootstrap',
        'angular.backtop',
        'monospaced.elastic',
        'apy-rest2front.view',
        'apy-rest2front.version'
    ])
        .provider('apyModal', function apyModalProvider () {
            this.$get = function apyModalFactory () {
                var $injector = angular.injector(['ng', 'ui.bootstrap']),
                    $uibModal = $injector.get('$uibModal');
                return new ApyModalProxy($injector.get('$rootScope'), $uibModal);
            };
        })
        .provider('apy', function apyProvider () {
            this.$get = function apyFactory () {
                var $injector = angular.injector(['ng', 'ngFileUpload']),
                    $log = $injector.get('$log'),
                    $http = $injector.get('$http'),
                    Upload = $injector.get('Upload');
                return new $globals.ApyCompositeService($log, $http, Upload, config);
            };
        })
        .config(['$routeProvider', function($routeProvider) {
            if(config.$auth()) {
                // Auth route
                $routeProvider.when('/login', {
                    templateUrl: config.viewPath('login.html'),
                    controller: 'apyLoginCtrl'
                });
            }
            // setting a generic parameter 'resource'
            $routeProvider.when('/:resource', {
                templateUrl: config.viewPath('view.html'),
                controller: 'apyViewCtrl'
            })
                // default route
                .otherwise({redirectTo: 'index'});
        }])
        .controller('indexCtrl', ['$scope', 'apy', '$location', function ($scope, apyProvider, $location) {
            if(config.$auth()) {
                $scope.$watch(apyProvider.isAuthenticated, function (value, oldValue) {
                    if (!value && oldValue) {
                        //console.log("Disconnect");
                        $location.path('/login');
                    }

                    if (value) {
                        //console.log("Connect");
                        $location.path('/index');
                    }
                }, true);
            }
        }]);

    if(config.$auth()) {
        app.controller('apyLoginCtrl', ['$scope', 'apy', 'apyModal', function ($scope, apyProvider, apyModalProvider) {
            if(!$scope.credentials ||
                !$scope.credentials.username ||
                !$scope.credentials.password) {
                $scope.credentials = {
                    username: undefined,
                    password: undefined
                };
            }

            // Auth Help link
            $scope.help = function (event) {
                event.preventDefault();

                apyModalProvider.info({
                    title: 'Restricted Area',
                    messages: [
                        'This area cannot be accessed freely.',
                        'If you need more info, please contact Administrator.',
                        'admin.web@apy-consulting.com'
                    ]
                });
            };

            $scope.login = function (event) {
                event.preventDefault();
                var errors = [];
                if(!$scope.credentials.username) {
                    errors.push('No username provided');
                }
                if(!$scope.credentials.password) {
                    errors.push('No password provided');
                }

                if(errors.length) {
                    apyModalProvider.error(new ApyEveError(errors));
                }
                else {
                    apyProvider.authenticate($scope.credentials)
                        .then(function () {
                            window.location.reload();
                        })
                        .catch(function (error) {
                            apyModalProvider.error(error);
                        });
                }
            };
        }]);

        app.run(['$rootScope', '$location', 'apy', function ($rootScope, $location, apyProvider) {
            $rootScope.$on('$routeChangeStart', function () {
                if (!apyProvider.isAuthenticated()) {
                    $location.path('/login');
                }
            });
        }]);
    }

})( window.angular, this );
