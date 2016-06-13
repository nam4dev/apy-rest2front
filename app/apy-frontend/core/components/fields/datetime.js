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
            if (!isDate(this.$memo)) {
                this.$memo = new Date(this.$memo);
            }
            return this.$value.getTime() !== this.$memo.getTime();
        }

        function cloneValue(value) {
            var clonedValue = value;
            // Non value & String values cases
            if (!value || isString(value)) {
                // String case
                if (isString(value)) {
                    clonedValue = new Date(value);
                }
                // Non value case
                else {
                    clonedValue = new Date();
                }
            }
            // Non value & String values cases
            else if(isDate(value)) {
                clonedValue = new Date(value.toUTCString());
            }
            // unhandled types case
            else {
                throw new Error('Unhandled type for datetime field: ' + typeof value);
            }
            return clonedValue;
        }

        function validate() {
            if (!isDate(this.$value)) {
                throw new Error('Datetime object or string expected');
            }
        }

        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.validate = validate;
            this.hasUpdated = hasUpdated;
            this.cloneValue = cloneValue;
            this.cleanedData = cleanedData;
            this.$Class = $window.ApyDatetimeField;
            this.initialize(service, name, schema, value, $states, $endpoint, $window.$TYPES.DATETIME, null);
            return this;
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyDatetimeField.prototype);
    $window.ApyFieldMixin.call(ApyDatetimeField.prototype);

})(window);
