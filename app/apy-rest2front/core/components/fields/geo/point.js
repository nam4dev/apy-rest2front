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
 *  GEO Point field abstraction (GeoJSON)
 *
 *  """
 */
(function ($window) {

    $window.ApyPointField = (function () {

        /**
         * Set a given value to attributes
         * `$value` & `$memo` respectively,
         * using `cloneValue` method
         *
         * @override
         * @param value
         * @returns {this}
         */
        function setValue(value) {
            this.$memo = this.cloneValue(value);
            this.$value = this.cloneValue(value);
            return this;
        }

        /**
         * Wrap the given value to clone
         * into its own ApyPoint instance.
         *
         * @override
         * @param value: An Object instance representing a Point
         * @returns {ApyPoint}
         */
        function cloneValue(value) {
            return new ApyPoint(value);
        }

        /**
         * Indicate whether the ApyPointField is updated or not
         *
         * @override
         * @returns {boolean}
         */
        function hasUpdated () {
            var updated = false;
            if(this.$memo.x !== this.$value.x) {
                updated = true;
            }
            if(this.$memo.y !== this.$value.y) {
                updated = true;
            }
            return updated;
        }

        /**
         * Return an cleaned Object instance representing a Point
         *
         * @override
         * @returns {Object}
         */
        function cleanedData () {
            this.validate();
            return this.$value.cleanedData();
        }

        /**
         * FIXME: disabled for now as it may not be necessary to validate, TBC
         * @override
         */
        function validate() {}

        /**
         * Return an ApyPointField representation as a String
         *
         * @override
         * @returns {string}
         */
        function toString() {
            this.$value.clean();
            return this.$name + ' coordinates(' + this.$value.coordinates + ')';
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
         * @returns {ApyPointField}
         */
        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.validate = validate;
            this.setValue = setValue;
            this.toString = toString;
            this.cloneValue = cloneValue;
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            this.$Class = $window.ApyPointField;
            this.initialize(service, name, schema, value, $states, $endpoint, $window.$TYPES.POINT, null);
            return this;
        }

    })();

    // Inject Mixins
    $window.ApyComponentMixin.call(ApyPointField.prototype);
    $window.ApyFieldMixin.call(ApyPointField.prototype);

})(window);
