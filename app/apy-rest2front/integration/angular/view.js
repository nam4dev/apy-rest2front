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
 *  `Generic` Angular View Controller
 *  Handles most of CRUD UI components actions
 *
 *  """
 */
(function ( $angular ) {'use strict';

    function setView( $context ) {

        var $scope = $context.$scope;
        var apyProvider = $context.apyProvider;
        var $routeParams = $context.$routeParams;
        var apyModalProvider = $context.apyModalProvider;

        var $currentResource = $routeParams.resource;

        var collection = apyProvider.createCollection( $currentResource );

        $scope.$collection = collection;
        $scope.$schemas = apyProvider.$schemasAsArray;

        function progress( counter ) {
            $scope.counter = counter;
        }

        collection.fetch( progress )
            .then(function () {
                $scope.$apply();
            }).catch(function ( error ) {
                apyModalProvider.error( error );
            });

        $scope.deleteResources = function () {
            var okCallback = function () {
                collection.delete();
                $scope.$apply();
            };
            apyModalProvider.warn(getWarningModalConfig(collection.savedComponents(), okCallback));
        };

        /* istanbul ignore next */
        $scope.create = function ( resource ) {
            var defer = resource.create();
            if(defer) {
                defer
                    .then(function () {
                        $scope.$apply();
                    })
                    .catch(function ( error ) {
                        apyModalProvider.error( error );
                    });
            }
            else {
                collection.removeResource( resource );
            }
        };

        /* istanbul ignore next */
        $scope.update = function ( resource ) {
            var defer = resource.update();
            if(defer){
                defer
                    .then(function () {
                        $scope.$apply();
                    })
                    .catch(function ( error ) {
                        apyModalProvider.error( error );
                    });
            }
        };

        /* istanbul ignore next */
        $scope.delete = function ( resource ) {
            var okCallback = function () {
                var defer = resource.delete();
                if(defer) {
                    defer
                        .then(function () {
                            collection.removeResource( resource );
                            $scope.$apply();
                        })
                        .catch(function ( error ) {
                            apyModalProvider.error( error );
                        });
                }
                else {
                    collection.removeResource( resource );
                }
            };
            apyModalProvider.warn( getWarningModalConfig( [resource], okCallback ) );
        };

        $scope.saveCollection = function () {
            collection.save()
                .then(function( inspections ) {
                    var create;
                    var update;
                    var errors;
                    try { create = inspections[0]._settledValueField; }
                    catch (e) { create = []; }
                    try { update = inspections[1]._settledValueField; }
                    catch (e) { update = []; }
                    errors = create.concat(update).filter(function( inspection ) {
                        return !inspection.isFulfilled();
                    });
                    if(errors && errors.length) {
                        var reasons = [];
                        errors.forEach(function ( error ) {
                            reasons.push(error.reason());
                        });
                        apyModalProvider.errors( reasons );
                    }
                })
                .then(function () {
                    $scope.$apply();
                })
                .catch(function ( error ) {
                    apyModalProvider.error( error );
                });
        };

        function getWarningModalConfig(components, okCallback, cancelCallback) {
            var count = components.length;

            cancelCallback = cancelCallback || function () {};

            function appendS() {
                if(count > 1) {
                    return 's';
                }
                return '';
            }

            function title() {
                return 'Warning - About to Delete : ' +
                    count + ' `' + $currentResource + '` resource' + appendS();
            }

            function message() {
                return 'Would you really like to delete ' +
                    count + ' listed `' + $currentResource + '` resource' + appendS() + ' ?';
            }

            function messages() {
                var messages = [];
                components.forEach(function ( comp ) {
                    messages.push( comp.toString() );
                });
                return messages;
            }
            return {
                title: title(),
                message: message(),
                messages: messages(),
                okCallback: okCallback,
                cancelCallback: cancelCallback
            };
        }
    }

    $angular.module('apy-rest2front.view', ['ngRoute'])

        .controller('apyViewCtrl', ['$location', '$rootScope', '$scope', '$routeParams', 'Upload', 'apy', 'apyModal',
            function($location, $rootScope, $scope, $routeParams, Upload, apyProvider, apyModalProvider) {

                function success () {
                    $scope.$schemas = apyProvider.$schemasAsArray;
                    if($routeParams.resource === 'index') {
                        $scope.isIndex = true;
                        return;
                    }
                    $scope.listDisplay = window.localStorage.getItem('listDisplay') || 'vertical';
                    setView({
                        $scope: $scope,
                        apyProvider: apyProvider,
                        $routeParams: $routeParams,
                        apyModalProvider: apyModalProvider
                    });
                }

                var display;

                $scope.displayVerticalList = function () {
                    display = 'vertical';
                    window.localStorage.setItem('listDisplay', display);
                    $scope.listDisplay = display;
                };

                $scope.displayHorizontalList = function () {
                    display = 'horizontal';
                    window.localStorage.setItem('listDisplay', display);
                    $scope.listDisplay = display;
                };

                $scope.logout = function () {
                    apyProvider.invalidate().then(function () {
                        window.localStorage.setItem('tokenInfo', apyProvider.$tokenInfo);
                        window.location.reload();
                    });
                };

                if(apyProvider.$schemasAsArray) {
                    success();
                }
                else {
                    apyProvider
                        .setDependencies({name: 'Upload', value: Upload})
                        .loadSchemas(true)
                        .then(function () {
                            success();
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
                template: '<ul class="nav navbar-nav"> \
                <li ng-repeat="schema in $schemas | orderBy:\'name\'" ng-if="!schema.hidden"> \
                <a href="#/{{ schema.name }}"> \
                <span class="text-capitalize"> \
                <strong>{{ schema.humanName || schema.name }}</strong> \
                </span> \
                </a> \
                </li> \
                </ul>'
            };
        }]);

})( window.angular );


