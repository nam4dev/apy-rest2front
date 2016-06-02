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

    $angular.module('apy.view', ['ngRoute'])

        .directive('apyField', [function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    field: '='
                },
                template: '<div ng-include="field.$contentUrl"></div>',
                controller: ['$scope', '$log', '$uibModal', 'apy', function ($scope, $log, $uibModal, apyProvider) {
                    var win;
                    $scope.opened = false;
                    $scope.displaySchemaNames = false;
                    $scope.dateOptions = {};
                    //$scope.$states = apyProvider.$states;
                    $scope.altInputFormats = ['M!/d!/yyyy'];
                    $scope.formats = ['yyyy-MMM-dd HH:mm:ss', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                    $scope.format = $scope.formats[0];

                    $scope.displayChoices = function () {
                        $scope.displaySchemaNames = true;
                    };

                    $scope.hideChoices = function () {
                        $scope.displaySchemaNames = false;
                    };

                    $scope.setFile = function (field, file) {
                        //console.log('MEDIA', field);
                        field.$value.setFile(file)
                            .then(function (_) {
                                $scope.$apply();
                            })
                            .catch(function (error) {
                                $log.error(error);
                            })
                    };

                    $scope.expandList = function (field) {
                        //console.log('expandList.field', field);
                        $scope.ok = function () {
                            win && win.dismiss('cancel');
                        };

                        $scope.cancel = function () {
                            win && win.dismiss('cancel');
                        };
                        //console.log('FIELD', field);
                        //$scope.field = field;
                        win = $uibModal.open({
                            animation: false,
                            templateUrl: 'modal-list.html',
                            controllerAs: 'ModalCtrl',
                            scope: $scope
                        });
                    };

                    $scope.expandRecursive = function (field) {
                        $scope.ok = function () {
                            field && field.loadValue && field.loadValue();
                            win && win.dismiss('cancel');
                        };

                        $scope.cancel = function () {
                            field && field.reset();
                            win && win.dismiss('cancel');
                        };
                        //$scope.field = field;
                        win = $uibModal.open({
                            animation: false,
                            templateUrl: 'modal-recursive.html',
                            controllerAs: 'ModalCtrl',
                            scope: $scope
                        });
                    };

                    $scope.resourcePicker = function (field) {
                        // UI Callbacks
                        $scope.cancel = function () {
                            win && win.dismiss('cancel');
                        };
                        // Data Layer

                        console.log('field.$relationName', field.$relationName);
                        console.log('field', field);

                        var collection = apyProvider.createCollection(field.$relationName);
                        collection.fetch().then(function (_) {
                            $scope.$collection = collection;
                            win = $uibModal.open({
                                animation: false,
                                templateUrl: 'modal-embedded.html',
                                controllerAs: 'ModalCtrl',
                                scope: $scope
                            });
                        });
                    };
                }]
            };
        }])

        .controller('ApyViewCtrl', ['$rootScope', '$scope', '$log', '$route', '$uibModal', 'Upload', 'apy',
            function($rootScope, $scope, $log, $route, $uibModal, Upload, apyProvider) {
                var collection = apyProvider.createCollection($route.current.name);

                $scope.updateHidden = false;
                $scope.validateHidden = true;
                $scope.$collection = collection;
                $scope.$schemas = apyProvider.$schemasAsArray;

                collection.fetch()
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
                    // TODO: Add confirmation box before deleting
                    var ok = confirm("Would you really like to delete " + collection.count() + " listed resources ?");
                    if(ok) {
                        collection.delete();

                    }
                };

                $scope.cancel = function () {
                    collection.setReadState();
                    $scope.updateHidden = false;
                    $scope.validateHidden = true;
                };

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

                $scope.delete = function (resource) {
                    var ok = confirm("Would you really like to delete resource: \n\n`" + resource.toString() + "` ?");
                    if(ok) {
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
                    }
                };
            }]);

})(window.angular);


