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
 */
(function($apy) {
    /**
     * Apy Boolean Field
     *
     * @class apy.components.fields.Boolean
     *
     * @augments apy.components.ComponentMixin
     * @augments apy.components.fields.FieldMixin
     *
     * @param {string} name Field name
     * @param {string} type Field type
     * @param {Object} schema Field schema
     * @param {Object} value Field value
     * @param {string} $endpoint Field endpoint
     * @param {Object} service Reference to Service instance
     * @param {Object} $states Field inner state holder instance
     * @param {string} relationName (optional) Field relation name
     */
    $apy.components.fields.Boolean = (function() {
        /**
         * Clone the value.
         * Ensure to always return a Boolean value (avoid undefined)
         *
         * @override
         * @memberOf apy.components.fields.Boolean
         *
         * @param {boolean} value A boolean or undefined value
         *
         * @return {boolean} The cloned boolean value
         */
        function cloneValue(value) {
            return value || false;
        }

        /**
         * Fix parent behavior by ensuring boolean value.
         *
         * @override
         * @memberOf apy.components.fields.Boolean
         *
         * @return {boolean} Is the Field updated ?
         */
        function hasUpdated() {
            this.$value = this.cleanedData();
            return this.parentHasUpdated();
        }

        /**
         * Return a boolean value
         *
         * @override
         * @memberOf apy.components.fields.Boolean
         *
         * @return {boolean} Field value
         */
        function cleanedData() {
            return this.$value || false;
        }

        /**
         * Apy Boolean Field
         *
         * @constructor
         *
         * @param {string} name Resource name
         * @param {string} type Resource type
         * @param {Object} schema Resource schema
         * @param {string} $endpoint Resource endpoint
         * @param {Object} service Reference to Service instance
         * @param {Array} components Resource initial components
         * @param {Object} $states Resource inner state holder instance
         * @param {string} relationName (optional) Resource relation name
         */
        return function(service, name, schema, value, $states, $endpoint, type, relationName) {
            this.$internalType = 'boolean';
            this.cleanedData = cleanedData;
            this.parentHasUpdated = this.hasUpdated;
            this.hasUpdated = hasUpdated;
            this.cloneValue = cloneValue;
            this.initialize(service, name, schema, value, $states, $endpoint, $apy.helpers.$TYPES.BOOLEAN, relationName);
            this.$Class = $apy.components.fields.Boolean;
            return this;
        };
    })();

    // Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.fields.Boolean.prototype
    );
    $apy.components.fields.FieldMixin.call(
        $apy.components.fields.Boolean.prototype
    );
})(apy);

