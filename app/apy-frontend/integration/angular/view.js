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

    var endpoint = 'http://localhost:8002/',
        schemaName = 'schemas';

    function setView($context) {

        var $log = $context.$log;
        var $scope = $context.$scope;
        var $uibModal = $context.$uibModal;
        var apyProvider = $context.apyProvider;
        var $routeParams = $context.$routeParams;

        var collection = apyProvider.createCollection($routeParams.resource);

        $scope.updateHidden = false;
        $scope.validateHidden = true;
        $scope.$collection = collection;
        $scope.$schemas = apyProvider.$schemasAsArray;

        function progress(counter) {
            $scope.counter = counter;
        }

        collection.fetch(progress)
            .then(function (_) {
                $scope.$apply();
            }).catch(function (error) {
                $log.error(error);
            });

        $scope.displayError = function (error) {
            var win;
            $scope.error = error;
            $scope.ok = function () {
                win && win.dismiss('cancel');
            };
            win = $uibModal.open({
                animation: true,
                templateUrl: 'modal-error.html',
                controllerAs: 'ModalCtrl',
                scope: $scope
            });
        };

        $scope.createResource = function () {
            collection.createResource()
                .setCreateState();
        };

        $scope.updateResource = function (resource) {
            resource.setUpdateState();
        };

        $scope.removeResource = function (resource) {
            collection.removeResource(resource);
        };

        $scope.updateResources = function () {
            collection.setUpdateState();
            $scope.updateHidden = true;
            $scope.validateHidden = false;
        };

        $scope.deleteResources = function () {
            $scope.ok = function () {
                collection.delete();
                win && win.dismiss('cancel');
            };
            $scope.cancel = function () {
                win && win.dismiss('cancel');
            };

            setWarningContext(collection.$components);

            var win = $uibModal.open({
                animation: true,
                templateUrl: 'modal-warning.html',
                controllerAs: 'ModalCtrl',
                scope: $scope
            });
        };

        $scope.saveAll = function () {
            collection.save();
            $scope.read();
        };

        $scope.read = function () {
            collection.setReadState();
            $scope.updateHidden = false;
            $scope.validateHidden = true;
        };

        /* istanbul ignore next */
        $scope.create = function (resource) {
            var defer = resource.create();
            if(defer) {
                defer
                    .then(function (_) {
                        if(resource.$type ===  "collection") {
                            $scope.updateHidden = false;
                            $scope.validateHidden = true;
                        }
                        $scope.$apply();
                    })
                    .catch(function (error) {
                        $scope.displayError(error);
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
                        if(resource.$type ===  "collection") {
                            $scope.updateHidden = false;
                            $scope.validateHidden = true;
                        }
                        $scope.$apply();
                    })
                    .catch(function (error) {
                        $scope.displayError(error);
                    });
            }
        };

        /* istanbul ignore next */
        $scope.delete = function (resource) {
            $scope.ok = function () {
                var defer = resource.delete();
                if(defer) {
                    defer
                        .then(function (_) {
                            collection.removeResource(resource);
                            $scope.$apply();
                        })
                        .catch(function (error) {
                            $scope.displayError(error);
                        });
                }
                else {
                    collection.removeResource(resource);
                }
                win && win.dismiss('cancel');
            };
            $scope.cancel = function () {
                win && win.dismiss('cancel');
            };

            setWarningContext([resource]);

            var win = $uibModal.open({
                animation: true,
                templateUrl: 'modal-warning.html',
                controllerAs: 'ModalCtrl',
                scope: $scope
            });
        };

        function setWarningContext(components) {
            var count;
            components = components || [];
            count = components.length;
            $scope.count = count;
            $scope.action = "Delete";
            $scope.message = "Would you really like to delete " + count + " listed resource";
            if(count > 1) {
                $scope.message += "s"
            }
            $scope.message += " ?";
            $scope.components = components;
        }
    }

    $angular.module('apy-frontend.view', ['ngRoute'])

        .controller('ApyViewCtrl', ['$rootScope', '$scope', '$log', '$routeParams', '$uibModal', 'Upload', 'apy',
            function($rootScope, $scope, $log, $routeParams, $uibModal, Upload, apyProvider) {

                function displayError(error) {
                    var win;
                    $scope.error = error;
                    $scope.ok = function () {
                        win && win.dismiss('cancel');
                    };
                    win = $uibModal.open({
                        animation: true,
                        templateUrl: 'modal-error.html',
                        controllerAs: 'ModalCtrl',
                        scope: $scope
                    });
                }

                function success (response) {
                    $scope.$schemas = apyProvider.$schemasAsArray;
                    if($routeParams.resource === 'index') {
                        $scope.isIndex = true;
                        return
                    }

                    $scope.displayLarge = true;
                    $scope.displayList = !$scope.displayLarge;

                    setView({
                        $log: $log,
                        $scope: $scope,
                        $uibModal: $uibModal,
                        apyProvider: apyProvider,
                        $routeParams: $routeParams
                    });
                }

                if(apyProvider.$schemasAsArray) {
                    success();
                }
                else {
                    apyProvider
                        .initEndpoints(endpoint, schemaName)
                        .setDependencies({name: "Upload", value: Upload})
                        .loadSchemas(true)
                        .then(function (response) {
                            success(response);
                            $scope.$apply();
                        })
                        .catch(function (error) {
                            var url;
                            try {
                                url = error.config.url;
                            } catch(e) {
                                url = error;
                            }
                            displayError({
                                data: {
                                    _error: {
                                        message: "Error " + url
                                    }
                                }
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


