/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy Frontend.
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
 *  `apy-frontend`  Copyright (C) 2016  (apy) Namgyal Brisson.
 *
 *  """
 *  Write here what the module does...
 *
 *  """
 */
/**
 * @namespace apy.integration.angular
 */

(function( $apy ) {
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

    /* istanbul ignore next */
    /**
     * Proxy of angular-ui modal
     *
     * Interface to manage heterogeneous Errors from
     * different backend (Eve, django-rest, ...)
     *
     * @class apy.integration.angular.ApyModalProxy
     *
     * @example
     * //...
     * function success(response) {
     *     if(!response) console.log('Nothing to create');
     *     else console.log('CREATE ', response);
     * }
     *
     * // @see `apy.components.Resource` for more details
     * resource.create()
     *         .then(success)
     *         // Interface to display Eve Error consistently
     *         .catch(apyModalProvider.error);
     *
     * @param {Object} $rootScope Angular `$rootScope` instance
     * @param {Object} $modal Angular-ui `$modal` instance
     *
     * @return {apy.integration.angular.ApyModalProxy}
     */
    function ApyModalProxy($rootScope, $modal) {
        var instances = [];
        var currentInstance;

        return {
            /**
             * Cancel the current instance
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             */
            cancel: function() {
                currentInstance && currentInstance.close(0);
            },
            /**
             * Cancel all modal instances
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             */
            cancelAll: function() {
                instances.forEach(function(instance) {
                    instance && instance.close(0);
                });
            },
            /**
             * Base method to factorize Modal logic
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             *
             * @param {Object} config A configuration object
             * @param {string} config.title Modal header title
             * @param {boolean} config.asList Display messages as list
             * @param {string} config.message A single message
             * @param {Array} config.messages A list of messages
             * @param {string} config.okBtnName OK name (default 'OK')
             * @param {string} config.cancelBtnName Cancel name (default 'Cancel')
             * @param {string} config.widgetClass bootstrap widget class (info, success, warning, danger, ...)
             * @param {string} config.okWidgetClass bootstrap widget class for OK button (info, success, warning, danger, ...)
             * @param {string} config.cancelWidgetClass bootstrap widget class for Cancel button (info, success, warning, danger, ...)
             * @param {Function} config.okCallback Callback to be called when OK button is pressed
             * @param {Function} config.cancelCallback Callback to be called when Cancel button is pressed
             */
            base: function base(config) {
                function isFunc(callback) {
                    return callback && $apy.helpers.isFunction(callback);
                }

                function executeIfPossible(callback) {
                    isFunc(callback) && callback();
                }

                function callbacksWrapper(isOk) {
                    if (isOk) {
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
                $scope.ok = function() {
                    $instance.close(1);
                };
                if (isFunc(cancelCallback)) {
                    $scope.cancel = function() {
                        $instance.close(0);
                    };
                }
                currentInstance = $instance = $modal.open(options);
                instances.push($instance);
                $instance.result.then(callbacksWrapper);
            },
            /**
             * Display an info modal
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             *
             * @param {Object} config A configuration object
             * @param {string} config.title Modal header title
             * @param {boolean} config.asList Display messages as list
             * @param {string} config.message A single message
             * @param {Array} config.messages A list of messages
             * @param {string} config.okBtnName OK name (default 'OK')
             * @param {string} config.cancelBtnName Cancel name (default 'Cancel')
             * @param {string} config.widgetClass bootstrap widget class (info, success, warning, danger, ...)
             * @param {string} config.okWidgetClass bootstrap widget class for OK button (info, success, warning, danger, ...)
             * @param {string} config.cancelWidgetClass bootstrap widget class for Cancel button (info, success, warning, danger, ...)
             * @param {Function} config.okCallback Callback to be called when OK button is pressed
             * @param {Function} config.cancelCallback Callback to be called when Cancel button is pressed
             */
            info: function info(config) {
                this.base(config);
            },
            /**
             * Display a warning modal
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             *
             * @param {Object} config A configuration object
             * @param {string} config.title Modal header title
             * @param {boolean} config.asList Display messages as list
             * @param {string} config.message A single message
             * @param {Array} config.messages A list of messages
             * @param {string} config.okBtnName OK name (default 'OK')
             * @param {string} config.cancelBtnName Cancel name (default 'Cancel')
             * @param {string} config.widgetClass bootstrap widget class (info, success, warning, danger, ...)
             * @param {string} config.okWidgetClass bootstrap widget class for OK button (info, success, warning, danger, ...)
             * @param {string} config.cancelWidgetClass bootstrap widget class for Cancel button (info, success, warning, danger, ...)
             * @param {Function} config.okCallback Callback to be called when OK button is pressed
             * @param {Function} config.cancelCallback Callback to be called when Cancel button is pressed
             */
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
                });
            },
            /**
             * Display an error modal
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             *
             * @param {Object} config A configuration object
             * @param {string} config.title Modal header title
             * @param {boolean} config.asList Display messages as list
             * @param {string} config.message A single message
             * @param {Array} config.messages A list of messages
             * @param {string} config.okBtnName OK name (default 'OK')
             * @param {string} config.cancelBtnName Cancel name (default 'Cancel')
             * @param {string} config.widgetClass bootstrap widget class (info, success, warning, danger, ...)
             * @param {string} config.okWidgetClass bootstrap widget class for OK button (info, success, warning, danger, ...)
             * @param {string} config.cancelWidgetClass bootstrap widget class for Cancel button (info, success, warning, danger, ...)
             * @param {Function} config.okCallback Callback to be called when OK button is pressed
             * @param {Function} config.cancelCallback Callback to be called when Cancel button is pressed
             */
            error: function error(config) {
                var cls = 'danger';
                config.widgetClass = cls;
                config.okWidgetClass = cls;
                this.base(config);
            },
            /**
             * Display an error modal
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             *
             * @param {Object} config A configuration object
             * @param {string} config.title Modal header title
             * @param {boolean} config.asList Display messages as list
             * @param {string} config.message A single message
             * @param {Array} config.messages A list of messages
             * @param {string} config.okBtnName OK name (default 'OK')
             * @param {string} config.cancelBtnName Cancel name (default 'Cancel')
             * @param {string} config.widgetClass bootstrap widget class (info, success, warning, danger, ...)
             * @param {string} config.okWidgetClass bootstrap widget class for OK button (info, success, warning, danger, ...)
             * @param {string} config.cancelWidgetClass bootstrap widget class for Cancel button (info, success, warning, danger, ...)
             * @param {Function} config.okCallback Callback to be called when OK button is pressed
             * @param {Function} config.cancelCallback Callback to be called when Cancel button is pressed
             */
            errors: function errors(config) {
                var messages = [];
                var cls = 'danger';
                config = config || {};
                config.widgetClass = cls;
                config.okWidgetClass = cls;
                if(!config.title) {
                    config.title = 'Errors';
                }
                if(!config.messages) {
                    config.messages = []
                }
                config.messages.forEach(function(error) {
                    var iter;
                    if ($apy.helpers.isObject(error.messages)) {
                        iter = [];
                        Object.keys(error.messages).forEach(function(k) {
                            iter.push(k + ' => ' + error.messages[k]);
                        });
                    }
                    else {
                        iter = error.messages;
                    }
                    messages.push(error.title);
                    iter.forEach(function(value) {
                        messages.push(value);
                    });
                });
                if(!messages.length) {
                    messages.push('No details found!')
                }
                config.messages = messages;
                this.base(config);
            },
            /**
             * Display a success modal
             *
             * @memberOf apy.integration.angular.ApyModalProxy
             *
             * @param {Object} config A configuration object
             * @param {string} config.title Modal header title
             * @param {boolean} config.asList Display messages as list
             * @param {string} config.message A single message
             * @param {Array} config.messages A list of messages
             * @param {string} config.okBtnName OK name (default 'OK')
             * @param {string} config.cancelBtnName Cancel name (default 'Cancel')
             * @param {string} config.widgetClass bootstrap widget class (info, success, warning, danger, ...)
             * @param {string} config.okWidgetClass bootstrap widget class for OK button (info, success, warning, danger, ...)
             * @param {string} config.cancelWidgetClass bootstrap widget class for Cancel button (info, success, warning, danger, ...)
             * @param {Function} config.okCallback Callback to be called when OK button is pressed
             * @param {Function} config.cancelCallback Callback to be called when Cancel button is pressed
             */
            success: function success(config) {
                var cls = 'success';
                config.widgetClass = cls;
                config.okWidgetClass = cls;
                this.base(config);
            }
        };
    }

    $apy.integration.angular.ApyModalProxy = ApyModalProxy;

})( apy );
