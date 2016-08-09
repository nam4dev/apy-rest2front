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
(function (angular) {'use strict';

    var messagesBasedTemplate = ' \
        <div class="modal-header btn-{{ widgetClass || \'info\' }}"> \
            <h3 class="modal-title">  \
                 <span class="text-capitalize" >  \
                     <strong>{{ title }}</strong>  \
                 </span>  \
            </h3>  \
        </div>  \
        <div class="modal-body">  \
            <p ng-if="message">  \
                <strong><i>{{ message }}</i></strong>  \
            </p> \
            <div class="alert alert-{{ widgetClass || \'info\' }}" role="alert" ng-if="messages && !messages.push" > \
                <p ng-repeat="(title, message) in messages track by $index"> \
                    {{ title }} => <strong>{{ message }}</strong> \
                </p> \
            </div> \
            <div class="alert alert-{{ widgetClass || \'info\' }}" role="alert" ng-if="messages && messages.push && messages.length" > \
                <ul class="list-group" ng-if="asList"> \
                    <li class="list-group-item" ng-repeat="message in messages track by $index"> \
                        <span class="badge" ng-if="numberedList">{{ $index + 1 }}</span> \
                        <strong>{{ message }}</strong> \
                    </li> \
                </ul> \
                <p ng-if="!asList" ng-repeat="message in messages track by $index"> \
                    <strong>{{ message }}</strong> \
                </p> \
            </div> \
        </div> \
        <div class="modal-footer"> \
            <button class="btn btn-{{ okWidgetClass || \'info\' }}" type="button" ng-click="ok()" ng-if="ok">{{ okBtnName || "Ok" }}</button> \
            <button class="btn btn-{{ cancelWidgetClass || \'default\' }}" type="button" ng-click="cancel()" ng-if="cancel">{{ cancelBtnName || "Cancel" }}</button> \
        </div> \
    ';

    var ApyModalProxy = function ($rootScope, $modal) {
        var instances = [];
        var currentInstance;

        return {
            cancel: function () {
                currentInstance && currentInstance.close(0);
            },
            cancelAll: function () {
                instances.forEach(function (instance) {
                    instance && instance.close(0);
                });
            },
            base: function base(config) {

                function isFunc(callback) {
                    return callback && isFunction(callback);
                }

                function executeIfPossible(callback) {
                    isFunc(callback) && callback();
                }

                function callbacksWrapper(isOk) {
                    if(isOk) {
                        executeIfPossible(okCallback);
                    }
                    else {
                        executeIfPossible(cancelCallback);
                    }
                }

                var $instance;
                var okCallback = config.okCallback;
                var cancelCallback = config.cancelCallback;
                var $scope = $rootScope.$new();

                var options = {
                    animation: config.animation || true,
                    template: messagesBasedTemplate,
                    controllerAs: 'ModalCtrl',
                    scope: $scope
                };

                $scope.title = config.title;
                $scope.asList = config.asList;
                $scope.message = config.message;
                $scope.messages = config.messages;
                $scope.okBtnName = config.okBtnName;
                $scope.numberedList = config.numberedList;
                $scope.cancelBtnName = config.cancelBtnName;
                $scope.widgetClass = config.widgetClass;
                $scope.okWidgetClass = config.okWidgetClass || config.widgetClass;
                $scope.cancelWidgetClass = config.cancelWidgetClass || config.widgetClass;
                // Define default OK button behavior
                $scope.ok = function () {
                    $instance.close(1);
                };
                if(isFunc(cancelCallback)) {
                    $scope.cancel = function () {
                        $instance.close(0);
                    };
                }
                currentInstance = $instance = $modal.open(options);
                instances.push($instance);
                $instance.result.then(callbacksWrapper);
            },
            info: function info(config) {
                this.base(config);
            },
            warn: function warn(config) {
                var cls = 'warning';
                this.base({
                    asList: true,
                    widgetClass: cls,
                    okWidgetClass: cls,
                    numberedList: true,
                    title: config.title,
                    message: config.message,
                    messages: config.messages,
                    okCallback: config.okCallback,
                    cancelCallback: config.cancelCallback
                })
            },
            error: function error(e, okCallback) {
                var cls = 'danger';
                this.base({
                    title: e.title,
                    messages: e.messages,
                    okCallback: okCallback,
                    cancelCallback: config.cancelCallback,
                    widgetClass: cls,
                    okWidgetClass: cls
                })
            },
            errors: function errors(errorList) {
                var cls = 'danger';
                var messages = [];
                errorList.forEach(function (error) {
                    console.log('Error', error);
                    var iter;
                    if(isObject(error.messages)) {
                        iter = [];
                        Object.keys(error.messages).forEach(function (k) {
                            iter.push(k + ' => ' + error.messages[k]);
                        });
                    }
                    else {
                        iter = error.messages;
                    }
                    messages.push(error.title);
                    iter.forEach(function (value) {
                        messages.push(value);
                    })
                });
                this.base({
                    title: "Errors",
                    messages: messages,
                    okCallback: config.okCallback,
                    cancelCallback: config.cancelCallback,
                    widgetClass: cls,
                    okWidgetClass: cls
                })
            },
            success: function success(config) {
                var cls = 'success';
                config.widgetClass = cls;
                config.okWidgetClass = cls;
                this.base(config);
            }
        }
    };

    var config = {
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
                isObject(this.auth) &&
                this.auth.enabled &&
                this.auth.client_id &&
                this.auth.endpoint &&
                this.auth.grant_type
            )
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
        .provider("apyModal", function apyModalProvider () {
            this.$get = function apyModalFactory () {
                var $injector = angular.injector(['ng', 'ui.bootstrap']),
                    $uibModal = $injector.get('$uibModal');
                return new ApyModalProxy($injector.get('$rootScope'), $uibModal);
            };
        })
        .provider("apy", function apyProvider () {
            this.$get = function apyFactory () {
                var $injector = angular.injector(['ng', 'ngFileUpload']),
                    $log = $injector.get('$log'),
                    $http = $injector.get('$http'),
                    Upload = $injector.get('Upload');
                return new ApyCompositeService($log, $http, Upload, config);
            };
        })
        .config(['$routeProvider', function($routeProvider) {
            if(config.$auth()) {
                // Auth route
                $routeProvider.when('/login', {
                    templateUrl: 'apy-rest2front/integration/angular/login.html',
                    controller: 'apyLoginCtrl'
                })
            }
            // setting a generic parameter 'resource'
            $routeProvider.when('/:resource', {
                templateUrl: 'apy-rest2front/integration/angular/view.html',
                controller: 'apyViewCtrl'
            })
                // default route
                .otherwise({redirectTo: 'index'});
        }])
        .controller('indexCtrl', ['$scope', 'apy', '$location', function ($scope, apyProvider, $location) {
            if(config.$auth()) {
                $scope.$watch(apyProvider.isAuthenticated, function (value, oldValue) {
                    if (!value && oldValue) {
                        console.log("Disconnect");
                        $location.path('/login');
                    }

                    if (value) {
                        console.log("Connect");
                        $location.path('/index');
                    }
                }, true)
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

            $scope.help = function (event) {
                event.preventDefault();

                apyModalProvider.info({
                    title: "Restricted Area",
                    messages: [
                        "This area cannot be accessed freely.",
                        "If you need more info, please contact Administrator.",
                        "admin.web@apy-consulting.com"
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
                        .then(function (response) {
                            window.location.reload();
                        })
                        .catch(function (error) {
                            apyModalProvider.error(error);
                        });
                }
            };
        }]);

        app.run(['$rootScope', '$location', 'apy', function ($rootScope, $location, apyProvider) {
            $rootScope.$on('$routeChangeStart', function (event) {
                if (!apyProvider.isAuthenticated()) {
                    $location.path('/login');
                }
            });
        }]);
    }

})(window.angular);
