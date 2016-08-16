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
 *  Datetime field abstraction
 *
 *  """
 */
(function ( $apy ) {

    /**
     * Apy Datetime Field
     *
     * @class apy.components.fields.Datetime
     *
     * @augments apy.components.ComponentMixin
     * @augments apy.components.fields.FieldMixin
     *
     * @param {string} name: Resource name
     * @param {string} type: Resource type
     * @param {Object} schema: Resource schema
     * @param {string} $endpoint: Resource endpoint
     * @param {Object} service: Reference to Service instance
     * @param {Array} components: Resource initial components
     * @param {Object} $states: Resource inner state holder instance
     * @param {string} relationName: (optional) Resource relation name
     */
    $apy.components.fields.Datetime = (function Datetime() {

        /**
         *
         * @returns {string}
         * @memberOf apy.components.fields.Datetime
         */
        function cleanedData() {
            this.validate();
            return this.$value.toUTCString();
        }

        /**
         *
         * @returns {boolean}
         * @memberOf apy.components.fields.Datetime
         */
        function hasUpdated() {
            if (!$apy.helpers.isDate(this.$memo)) {
                this.$memo = new Date(this.$memo);
            }
            return this.$value.getTime() !== this.$memo.getTime();
        }

        /**
         *
         * @param value
         * @returns {*}
         * @memberOf apy.components.fields.Datetime
         */
        function cloneValue(value) {
            var clonedValue = value;
            // Non value & String values cases
            if (!value || $apy.helpers.isString(value)) {
                // String case
                if ($apy.helpers.isString(value)) {
                    clonedValue = new Date(value);
                }
                // Non value case
                else {
                    clonedValue = new Date();
                }
            }
            // Non value & String values cases
            else if($apy.helpers.isDate(value)) {
                clonedValue = new Date(value.toUTCString());
            }
            // unhandled types case
            else {
                throw new $apy.Error('Unhandled type for datetime field: ' + typeof value);
            }
            return clonedValue;
        }

        /**
         * @memberOf apy.components.fields.Datetime
         */
        function validate() {
            if (!$apy.helpers.isDate(this.$value)) {
                throw new $apy.Error('Datetime object or string expected');
            }
        }

        /**
         *
         * @returns {this}
         * @memberOf apy.components.fields.Datetime
         */
        function toString() {
            return (this.$value && this.$value.toUTCString) ? this.$value.toUTCString() : this.$value;
        }

        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
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

})( apy );
