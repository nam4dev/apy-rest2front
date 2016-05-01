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
                    var resourcePickerWindow;
                    $scope.opened = false;
                    $scope.dateOptions = {};
                    //$scope.$states = apyProvider.$states;
                    $scope.altInputFormats = ['M!/d!/yyyy'];
                    $scope.formats = ['yyyy-MMM-dd HH:mm:ss', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                    $scope.format = $scope.formats[0];

                    $scope.expandNested = function (field) {
                        $scope.ok = function () {
                            field && field.loadValue && field.loadValue();
                            resourcePickerWindow && resourcePickerWindow.dismiss('cancel');
                        };

                        $scope.cancel = function () {
                            field && field.reset();
                            resourcePickerWindow && resourcePickerWindow.dismiss('cancel');
                        };
                        $scope.field = field;
                        resourcePickerWindow = $uibModal.open({
                            animation: false,
                            templateUrl: 'modal-nested.html',
                            controllerAs: 'ModalCtrl',
                            scope: $scope
                        });
                    };

                    $scope.resourcePicker = function (field) {
                        // UI Callbacks
                        $scope.cancel = function () {
                            resourcePickerWindow && resourcePickerWindow.dismiss('cancel');
                        };
                        // Data Layer
                        var collection = apyProvider.createCollection(field.$relationName);
                        collection.fetch().then(function (_) {
                            $scope.$collection = collection;
                            resourcePickerWindow = $uibModal.open({
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
                        $log.debug('[views.js] Collection', collection);
                        $scope.$apply();
                    }).catch(function (error) {
                        $log.error(error);
                    });

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
                        $log.log("CONFIRMED");
                        $log.log("About to delete", collection.count(), "resources...");
                        //collection.delete();
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
                        defer.then(function (_) {
                            if(resource.$type ===  "collection") {
                                $scope.updateHidden = false;
                                $scope.validateHidden = true;
                            }
                            $scope.$apply();
                        });
                    }
                    else {
                        collection.removeResource(resource);
                    }
                };

                $scope.update = function (resource) {
                    var defer = resource.update();
                    if(defer){
                        defer.then(function (_) {
                            if(resource.$type ===  "collection") {
                                $scope.updateHidden = false;
                                $scope.validateHidden = true;
                            }
                            $scope.$apply();
                        });
                    }
                    // TODO: Resource must handle a save method
                    // TODO: Resource must used here instead of Collection
                    // TODO: Collection shall only be used for macro/overall actions
                };

                $scope.delete = function (resource) {
                    var ok = confirm("Would you really like to delete resource: \n\n`" + resource.toString() + "` ?");
                    if(ok) {
                        var defer = resource.delete();
                        if(defer) {
                            defer.then(function (_) {
                                collection.removeResource(resource);
                                $scope.$apply();
                            });
                        }
                        else {
                            collection.removeResource(resource);
                        }
                    }
                };
            }]);

})(window.angular);


