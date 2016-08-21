/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy REST2Front.
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
 *  `apy-rest2front`  Copyright (C) 2016  (apy) Namgyal Brisson.
 *
 *  """
 *  AngularJs integration : field directive
 *
 *  """
 */

(function($angular, $apy) {'use strict';

    $angular.module('apy-rest2front.view')

        .controller('ApyFieldCtrl', ['$scope', '$uibModal', 'apy', 'apyModal', function($scope, $uibModal, apyProvider, apyModalProvider) {
            var win;
            $scope.opened = false;
            $scope.displaySchemaNames = false;
            $scope.dateOptions = {};
            // $scope.$states = apyProvider.$states;
            $scope.altInputFormats = ['M!/d!/yyyy'];
            $scope.formats = ['yyyy-MMM-dd HH:mm:ss', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];

            $scope.displayChoices = function() {
                $scope.displaySchemaNames = true;
            };

            $scope.hideChoices = function() {
                $scope.displaySchemaNames = false;
            };

            /* istanbul ignore next */
            $scope.setFile = function(field, file) {
                field.$value.load(file)
                    .then(function() {
                        $scope.$apply();
                    })
                    .catch(function(error) {
                        var err = new $apy.errors.Error(error);
                        apyModalProvider.error(err);
                    });
            };

            $scope.expandList = function(field) {
                $scope.ok = function() {
                    win && win.dismiss('cancel');
                };

                $scope.cancel = function() {
                    win && win.dismiss('cancel');
                };
                if (!field.count()) {
                    field.oneMore();
                }
                win = $uibModal.open({
                    animation: false,
                    templateUrl: 'modal-list.html',
                    controllerAs: 'ModalCtrl',
                    scope: $scope
                });
            };

            $scope.expandRecursive = function(field) {
                $scope.ok = function() {
                    win && win.dismiss('cancel');
                };

                $scope.cancel = function() {
                    field && field.reset();
                    win && win.dismiss('cancel');
                };
                win = $uibModal.open({
                    animation: false,
                    templateUrl: 'modal-recursive.html',
                    controllerAs: 'ModalCtrl',
                    scope: $scope
                });
            };

            /* istanbul ignore next */
            $scope.resourcePicker = function(field) {
                // UI Callbacks
                $scope.cancel = function() {
                    win && win.dismiss('cancel');
                };
                // Data Layer
                try {
                    var collection = apyProvider.createCollection(field.$relationName);
                    collection.fetch().then(function() {
                        $scope.$collection = collection;
                        win = $uibModal.open({
                            animation: false,
                            templateUrl: 'modal-embedded.html',
                            controllerAs: 'ModalCtrl',
                            scope: $scope
                        });
                    });
                } catch (error) {
                    var err = new $apy.errors.EveHTTPError({
                        data: {
                            _error: {
                                code: 'UNEXPECTED',
                                message: '' + error
                            }
                        }
                    });
                    apyModalProvider.error(err);
                }
            };
        }])
        .directive('apyField', /* istanbul ignore next */ function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    field: '='
                },
                template: '<div ng-include="field.$contentUrl"></div>',
                controller: 'ApyFieldCtrl'
            };
        });
})(window.angular, apy);
