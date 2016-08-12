/**
 *  @license
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
 *  Boolean field abstraction
 *
 *  """
 */

(function ($window) {

    $window.ApyBooleanField = (function () {

        /**
         * Clone the value.
         * Ensure to always return a Boolean value (avoid undefined)
         *
         * @override
         * @param value: A boolean or undefined value
         * @returns {Boolean}
         */
        function cloneValue(value) {
            return value || false;
        }

        /**
         * Fix parent behavior by ensuring boolean value.
         *
         * @override
         * @returns {Boolean}
         */
        function hasUpdated() {
            this.$value = this.cleanedData();
            return this.parentHasUpdated();
        }

        /**
         * Return a boolean value
         *
         * @override
         * @returns {boolean}
         */
        function cleanedData() {
            return this.$value || false;
        }

        /**
         * Common Component interface
         *
         * @constructor
         * @param service
         * @param name
         * @param schema
         * @param value
         * @param $states
         * @param $endpoint
         * @param type
         * @param relationName
         * @returns {ApyBooleanField}
         */
        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.$internalType = 'boolean';
            this.cleanedData = cleanedData;
            this.parentHasUpdated = this.hasUpdated;
            this.hasUpdated = hasUpdated;
            this.cloneValue = cloneValue;
            this.initialize(service, name, schema, value, $states, $endpoint, $window.$TYPES.BOOLEAN, null);
            this.$Class = $window.ApyBooleanField;
            return this;
        }

    })();

    // Inject Mixins
    $window.ApyComponentMixin.call(ApyBooleanField.prototype);
    $window.ApyFieldMixin.call(ApyBooleanField.prototype);

})(window);


