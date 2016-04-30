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

                    $scope.resourcePicker = function (field) {
                        // UI Callbacks
                        $scope.select = function (resource) {
                            field.updateSelf(resource);
                            resourcePickerWindow && resourcePickerWindow.dismiss('cancel');
                        };
                        $scope.cancel = function () {
                            resourcePickerWindow && resourcePickerWindow.dismiss('cancel');
                        };
                        // Data Layer
                        var collection = apyProvider.createCollection(field.$relationName);
                        collection.fetch().then(function (_) {
                            $scope.$collection = collection;
                            resourcePickerWindow = $uibModal.open({
                                animation: false,
                                templateUrl: 'modal.html',
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
                    .then(function (response) {
                        //$log.debug('Col', collection);
                        $scope.$apply();
                    }).catch(function (error) {
                        $log.error(error);
                    });

                $scope.createResource = function () {
                    var resource = collection
                        .createResource()
                        .setCreateState();

                    //$log.log("Resource =>", resource);
                    //$log.log("Resource.$endpointBase =>", resource.$endpointBase);
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
                    $log.log('CREATE PROMISE =>', defer);
                    if(defer) {
                        defer.then(function (response) {
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
                    $log.log('UPDATE PROMISE =>', defer);
                    if(defer){
                        defer.then(function (response) {
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
                        $log.log("CONFIRMED");
                        $log.log("About to delete", resource.toString(), "...");
                        var defer = resource.delete();
                        if(defer) {
                            defer.then(function (response) {
                                collection.removeResource(resource);
                                $scope.$apply();
                            });
                        }
                        else {
                            collection.removeResource(resource);
                        }
                    }
                };

                //// Initialisation
                //var schemaName = $route.current.name,
                //    schemas = apyProvider.formatSchemas2Object($route.current.schemas),
                //    collection = apyProvider.createCollection(schemas, schemaName, true),
                //    windowStack = apyProvider.createStack([]),
                //
                //    onStateEvent = function (action, message) {
                //        apyProvider.onStateTransition(action, message, $scope);
                //    },
                //    onAfterOkEvent = function (message) {
                //        onStateEvent('ok', message);
                //    },
                //    onAfterCancelEvent = function (message) {
                //        onStateEvent('cancel', message);
                //    };
                //
                ///**
                // *
                // */
                //var initialize = function () {
                //    $scope.files = [];
                //    $scope.errors = [];
                //    $scope.nestedSubItem = null;
                //    $scope.memoNestedFields = {};
                //    $scope.originalFieldData = null;
                //    $scope.collection = collection;
                //    $scope.states = apyProvider.states;
                //    $scope.memoNestedField = apyProvider.createStack();
                //
                //    collection.fetch()
                //        .then(function () {
                //            $scope.$apply();
                //        })
                //        .catch(function (error) {
                //            $scope.errors.push(error);
                //            $log.error(error);
                //            $scope.$apply();
                //        });
                //};
                //
                ///**
                // *
                // * @param blob
                // * @param filename
                // */
                //$scope.printBlob = function (blob, filename) {
                //    window.blobPrinter(blob, filename);
                //};
                //
                ///**
                // *
                // * @param field
                // * @param resource
                // * @param validator
                // * @param isInitial
                // */
                //$scope.nestedResourcePicker = function (field, validator, resource, isInitial) {
                //    apyProvider.onNestedResourceTransition(field, validator, resource, isInitial, $scope);
                //};
                //
                ///**
                // *
                // * @param field
                // * @param validator
                // */
                //$scope.embeddedResourcesPicker = function (field, validator) {
                //    apyProvider.onEmbeddedResourceTransition(field, validator, $scope);
                //};
                //
                ///**
                // *
                // * @param resource
                // */
                //$scope.updateForm = function (resource) {
                //    apyProvider.updateTransition();
                //    $scope.resource = resource;
                //    $scope.schema = collection.schema;
                //    $scope.open();
                //
                //};
                //
                ///**
                // *
                // */
                //$scope.createForm = function () {
                //    apyProvider.createTransition();
                //    $scope.resource = collection.createResource(null, true);
                //    $scope.schema = collection.schema;
                //    $scope.open();
                //};
                //
                ///**
                // *
                // * @param resource
                // */
                //$scope.deleteForm = function (resource) {
                //    apyProvider.deleteTransition();
                //    $scope.item2delete = resource;
                //    $scope.open();
                //};
                //
                ///**
                // *
                // */
                //$scope.createItem = function () {
                //    collection.create($scope.resource).then(function (result) {
                //        $scope.onResult({result: result, status: result.status}, true);
                //    }).catch(function (result) {
                //        $scope.onResult({result: result, status: -1}, true);
                //    });
                //};
                //
                ///**
                // *
                // */
                //$scope.updateItem = function () {
                //    collection.update($scope.resource).then(function (result) {
                //        $scope.onResult({result: result, status: result.status});
                //    }).catch(function (result) {
                //        $scope.onResult({result: result, status: -1});
                //    });
                //};
                //
                ///**
                // *
                // */
                //$scope.deleteItem = function () {
                //    collection.delete($scope.item2delete).then(function (result) {
                //        $scope.onResult({result: result, status: result.status}, true);
                //    }).catch(function (result) {
                //        $scope.onResult({result: result, status: -1}, true);
                //    });
                //};
                //
                ///**
                // *
                // * @param apply
                // * @param message
                // */
                //$scope.onResult = function (message, apply=false) {
                //    $scope.errors = [];
                //    if (message.status === -1) {
                //        var errors = message.result;
                //        $scope.errors = errors._issues ? errors._issues : errors._error;
                //        $log.error($scope.errors);
                //    }
                //    else {
                //        var win = windowStack.unstack();
                //        win.close(message);
                //    }
                //
                //    if(apply) {
                //        $scope.$apply();
                //    }
                //};
                //
                ///**
                // *
                // * @param size
                // */
                //$scope.open = function (size) {
                //
                //    switch (apyProvider.states.getCurrent()) {
                //        case apyProvider.states.$$SELECTION:
                //            $scope.selectEmbeddedResource = function (resource, selected) {
                //                var win = windowStack.unstack();
                //                win.close({
                //                    resource: resource,
                //                    field: $scope.fieldName,
                //                    selected: selected
                //                });
                //            };
                //            break;
                //    }
                //
                //    /**
                //     *
                //     */
                //    $scope.ok = function () {
                //        switch (apyProvider.states.getCurrent()) {
                //            case apyProvider.states.$$CREATE:
                //                $scope.createItem();
                //                break;
                //            case apyProvider.states.$$UPDATE:
                //                $scope.updateItem();
                //                break;
                //            case apyProvider.states.$$NESTED:
                //                $scope.onResult({});
                //                break;
                //            case apyProvider.states.$$DELETE:
                //                $scope.deleteItem();
                //                break;
                //            case apyProvider.states.$$SELECTION:
                //                $scope.nestedSchema = undefined;
                //                $scope.onResult({result: {_issues: ''}, status: -1});
                //                break;
                //            default :
                //                $log.log('ERROR: Unexpected state `' + current + '`');
                //                break;
                //        }
                //    };
                //
                //    /**
                //     *
                //     */
                //    $scope.cancel = function () {
                //        var win = windowStack.unstack();
                //        win.dismiss('cancel');
                //    };
                //
                //    var win = $uibModal.open({
                //        animation: false,
                //        templateUrl: 'myModalContent.html',
                //        controllerAs: 'ModalInstanceCtrl',
                //        size: size,
                //        scope: $scope
                //    });
                //
                //    windowStack.stack(win, true);
                //    win.result.then(onAfterOkEvent, onAfterCancelEvent);
                //};
                //
                //initialize();
            }]);

})(window.angular);


