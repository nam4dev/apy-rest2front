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
 *  Angular signin page controller
 *
 *  """
 */
/* istanbul ignore next */
(function(angular, $apy) {
    'use strict';

    var app = $apy.integration.app;
    var settings = $apy.settings.get();

    app.controller('apySignInCtrl', ['$scope', 'apy', 'apyModal', function ($scope, apyProvider, apyModalProvider) {
        if (!$scope.credentials ||
            !$scope.credentials.username ||
            !$scope.credentials.password) {
            $scope.credentials = {
                username: undefined,
                password: undefined
            };
        }
        $scope.signInIcon = settings.getIconByName('signin_icon.jpg');

        // Auth Help link
        $scope.needHelp = function (event) {
            event.preventDefault();
            apyModalProvider.info({
                title: 'Restricted Area',
                messages: [
                    'This area cannot be accessed freely.',
                    'If you need more info, please contact Administrator.'
                ]
            });
        };

        $scope.signIn = function (event) {
            event.preventDefault();
            var errors = [];
            if (!$scope.credentials.username) {
                errors.push('No username provided');
            }
            if (!$scope.credentials.password) {
                errors.push('No password provided');
            }

            if (errors.length) {
                apyModalProvider.errors(new $apy.errors.EveError(errors));
            }
            else {
                apyProvider.authenticate('token-based', {
                    username: $scope.credentials.username,
                    password: $scope.credentials.password,
                })
                    .then(
                        function (response) {
                            response = settings.authentication.transformResponse(response);
                            localStorage.setItem('User', response);
                            location.reload();
                        },
                        function (error) {
                            apyModalProvider.error(error);
                        }
                    );
            }
        };
    }]);
})(window.angular, apy);