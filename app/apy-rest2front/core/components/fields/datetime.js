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
     * Apy Datetime Field
     *
     * @class apy.components.fields.Datetime
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
    $apy.components.fields.Datetime = (function Datetime() {
        /**
         * Return a datetime represented in UTC time
         *
         * @override
         * @memberOf apy.components.fields.Datetime
         *
         * @return {string} datetime represented in UTC time
         */
        function cleanedData() {
            this.validate();
            return this.$value.toUTCString();
        }

        /**
         * Is the time between memo and current value different ?
         *
         * @override
         * @memberOf apy.components.fields.Datetime
         *
         * @return {boolean} whether it is updated or not
         */
        function hasUpdated() {
            if (!$apy.helpers.isDate(this.$memo)) {
                this.$memo = new Date(this.$memo);
            }
            return this.$value.getTime() !== this.$memo.getTime();
        }

        /**
         * Clone the datetime either as string or as object
         *
         * @override
         * @memberOf apy.components.fields.Datetime
         *
         * @param {string|Date} date A datetime string or object
         *
         * @return {Date} A datetime object
         */
        function cloneValue(date) {
            var clonedValue = date;
            // Non value & String values cases
            if (!date || $apy.helpers.isString(date)) {
                // String case
                if ($apy.helpers.isString(date)) {
                    clonedValue = new Date(date);
                }
                // Non value case
                else {
                    clonedValue = new Date();
                }
            }
            // Non value & String value cases
            else if ($apy.helpers.isDate(date)) {
                clonedValue = new Date(date.toUTCString());
            }
            // unhandled types case
            else {
                throw new $apy.errors.Error('Unhandled type for datetime field: ' + typeof date);
            }
            return clonedValue;
        }

        /**
         * Validate Field value
         *
         * @override
         * @memberOf apy.components.fields.Datetime
         *
         * @throws {apy.errors.Error} When current value is not a datetime object
         */
        function validate() {
            if (!$apy.helpers.isDate(this.$value)) {
                throw new $apy.errors.Error('Datetime object or string expected');
            }
        }

        /**
         * Datetime field string representation
         *
         * @override
         * @memberOf apy.components.fields.Datetime
         *
         * @return {string} Datetime field string representation
         */
        function toString() {
            if(this.$render) {
                return this.$render(this);
            }
            return (this.$value && this.$value.toUTCString) ? this.$value.toUTCString() : (this.$value + '');
        }

        return function(service, name, schema, value, $states, $endpoint, type, relationName) {
            this.toString = toString;
            this.validate = validate;
            this.hasUpdated = hasUpdated;
            this.cloneValue = cloneValue;
            this.cleanedData = cleanedData;
            this.$internalType = 'object';
            this.initialize(service, name, schema, value, $states, $endpoint, $apy.helpers.$TYPES.DATETIME, relationName);
            this.$Class = $apy.components.fields.Datetime;
            return this;
        };
    })();

    // Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.fields.Datetime.prototype
    );
    $apy.components.fields.FieldMixin.call(
        $apy.components.fields.Datetime.prototype
    );
})(apy);
