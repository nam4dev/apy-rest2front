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

(function ($window) {

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

    $window.ApyModalProxy = function ($rootScope, $modal) {
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
                    widgetClass: cls,
                    okWidgetClass: cls
                })
            },
            errors: function errors(errorList) {
                var cls = 'danger';
                var messages = [];
                errorList.forEach(function (error) {
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

})(window);
