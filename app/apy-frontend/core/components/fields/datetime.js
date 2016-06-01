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
 *  Datetime field abstraction
 *
 *  """
 */
(function ($window) {

    $window.ApyDatetimeField = (function () {

        function cleanedData() {
            this.validate();
            return this.$value.toUTCString();
        }

        function hasUpdated() {
            if (!isDate(this.$memo)) this.$memo = new Date(this.$memo);
            return this.$value.getTime() !== this.$memo.getTime();
        }

        function clone(value) {
            return new Date(value);
        }

        return function (service, name, type, value, options, $states, $endpoint) {
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            this.clone = clone;
            this.initialize(service, name, type, value, options, $states, $endpoint);
            return this;
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyDatetimeField.prototype);
    $window.ApyFieldMixin.call(ApyDatetimeField.prototype);

})(window);