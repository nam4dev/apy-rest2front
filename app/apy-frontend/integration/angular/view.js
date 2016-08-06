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
 *  `Generic` Angular View Controller
 *  Handles most of CRUD UI components actions
 *
 *  """
 */
(function ($angular) {'use strict';

    function setView($context) {

        var $scope = $context.$scope;
        var apyProvider = $context.apyProvider;
        var $routeParams = $context.$routeParams;
        var apyModalProvider = $context.apyModalProvider;

        var collection = apyProvider.createCollection($routeParams.resource);

        $scope.$collection = collection;
        $scope.$schemas = apyProvider.$schemasAsArray;

        function progress(counter) {
            $scope.counter = counter;
        }

        collection.fetch(progress)
            .then(function (_) {
                $scope.$apply();
            }).catch(function (error) {
                apyModalProvider.error(error);
            });

        $scope.deleteResources = function () {
            var okCallback = function () {
                collection.delete();
                $scope.$apply();
            };
            apyModalProvider.warn(getWarningModalConfig(collection.$components, okCallback));
        };

        /* istanbul ignore next */
        $scope.create = function (resource) {
            var defer = resource.create();
            if(defer) {
                defer
                    .then(function (_) {
                        $scope.$apply();
                    })
                    .catch(function (error) {
                        apyModalProvider.error(error);
                    });
            }
            else {
                collection.removeResource(resource);
            }
        };

        /* istanbul ignore next */
        $scope.update = function (resource) {
            var defer = resource.update();
            if(defer){
                defer
                    .then(function (_) {
                        $scope.$apply();
                    })
                    .catch(function (error) {
                        apyModalProvider.error(error);
                    });
            }
        };

        /* istanbul ignore next */
        $scope.delete = function (resource) {
            var okCallback = function () {
                var defer = resource.delete();
                if(defer) {
                    defer
                        .then(function (_) {
                            collection.removeResource(resource);
                            $scope.$apply();
                        })
                        .catch(function (error) {
                            apyModalProvider.error(error);
                        });
                }
                else {
                    collection.removeResource(resource);
                }
            };
            apyModalProvider.warn(getWarningModalConfig([resource], okCallback));
        };

        $scope.saveCollection = function () {
            collection.create()
                .filter(function(inspection) {
                    return !inspection.isFulfilled();
                })
                .then(function (errors) {
                    if(errors && errors.length) {
                        var reasons = [];
                        errors.forEach(function (error) {
                            reasons.push(error.reason());
                        });
                        apyModalProvider.errors(reasons);
                        return false;
                    }
                    return true;
                })
                .then(function (ok) {
                    console.log('Returned value from piping', ok);
                    $scope.$apply();
                })
                .catch(function (error) {
                    console.log('Error', error);
                    apyModalProvider.error(error);
                })
        };

        function getWarningModalConfig(components, okCallback, cancelCallback) {
            var count = components.length;

            cancelCallback = cancelCallback || function () {

                };

            function title() {
                var title = 'Warning - About to Delete : ' + count + ' Resource';
                if(count > 1) {
                    title += 's'
                }
                return title;
            }

            function message() {
                var message = "Would you really like to delete " + count + " listed resource";
                if(count > 1) {
                    message += "s";
                }
                message += " ?";
                return message;
            }

            function messages() {
                var messages = [];
                components.forEach(function (comp) {
                    messages.push(comp.toString());
                });
                return messages;
            }
            return {
                title: title(),
                message: message(),
                messages: messages(),
                okCallback: okCallback,
                cancelCallback: cancelCallback
            }
        }
    }

    $angular.module('apy-frontend.view', ['ngRoute'])

        .controller('apyViewCtrl', ['$location', '$rootScope', '$scope', '$routeParams', 'Upload', 'apy', 'apyModal',
            function($location, $rootScope, $scope, $routeParams, Upload, apyProvider, apyModalProvider) {

                function success (response) {
                    $scope.$schemas = apyProvider.$schemasAsArray;
                    if($routeParams.resource === 'index') {
                        $scope.isIndex = true;
                        return
                    }

                    $scope.displayLarge = true;
                    $scope.displayList = !$scope.displayLarge;

                    setView({
                        $scope: $scope,
                        apyProvider: apyProvider,
                        $routeParams: $routeParams,
                        apyModalProvider: apyModalProvider
                    });
                }

                $scope.logout = function () {
                    apyProvider.invalidate();
                };

                if(apyProvider.$schemasAsArray) {
                    success();
                }
                else {
                    apyProvider
                        .setDependencies({name: "Upload", value: Upload})
                        .loadSchemas(true)
                        .then(function (response) {
                            success(response);
                            $scope.$apply();
                        })
                        .catch(function (error) {
                            apyModalProvider.error(error, function () {
                                $location.path('/login');
                            });
                        });
                }
            }])
        .directive('apyNavigation', [function () {
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


