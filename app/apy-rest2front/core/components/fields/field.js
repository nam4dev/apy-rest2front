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
 *  `apy-rest2front`  Copyright (C) 2016  (apy) Namgyal Brisson.
 *
 *  """
 *  Apy Field Component abstraction
 *
 *  """
 */
/**
 * @namespace apy.components.fields
 */
(function ( $apy ) {'use strict';

    /**
     *  Base mixin to be coupled
     *  to ComponentMixin for Field Classes
     *
     * @mixin apy.components.fields.FieldMixin
     */
    $apy.components.fields.FieldMixin =  (function FieldMixin() { // Registering mixin globally

        /**
         *
         * @param schema
         * @returns {setOptions}
         * @memberOf apy.components.fields.FieldMixin
         */
        function setOptions(schema) {
            schema = schema || {};
            this.$schema = schema;
            this.$minlength = schema.minlength || this.$minlength;
            this.$maxlength = schema.maxlength || this.$maxlength;
            this.$unique = schema.unique || this.$unique || false;
            this.$required = schema.required || this.$required || false;
            this.$allowed = schema.allowed || this.$allowed || [];
            return this;
        }

        /**
         *
         * @param value
         * @returns {setValue}
         * @memberOf apy.components.fields.FieldMixin
         */
        function setValue(value) {
            if(!value) {
                var factory = this.$typesFactory[this.$type];
                value = factory ? factory() : undefined;
            }
            this.$memo = this.cloneValue(value);
            this.$value = this.cloneValue(value);
            return this;
        }

        /**
         *
         * @returns {this}
         * @memberOf apy.components.fields.FieldMixin
         */
        function selfCommit() {
            this.$memo = this.cloneValue(this.$value);
            return this;
        }

        /**
         *
         * @param update
         * @returns {this}
         * @memberOf apy.components.fields.FieldMixin
         */
        function selfUpdate(update) {
            this.$value = this.cloneValue(update.$value);
            return this;
        }

        /**
         * @memberOf apy.components.fields.FieldMixin
         */
        function cleanedData() {
            this.validate();
            return this.$value;
        }

        /**
         *
         * @private
         * @returns {string}
         * @memberOf apy.components.fields.FieldMixin
         */
        function _errorMsg() {
            var msg = 'Field.' + this.$name + ' did not validate' + '\n';
            msg += 'Type should be ' + this.$internalType + ', got ' + typeof this.$value;
            return msg;
        }

        /**
         * @memberOf apy.components.fields.FieldMixin
         */
        function validate() {
            if(this.$value && typeof this.$value !== this.$internalType) {
                throw new $apy.Error(this._errorMsg());
            }
        }

        return function () {
            this.validate = validate;
            this.setValue = setValue;
            this._errorMsg = _errorMsg;
            this.setOptions = setOptions;
            this.selfUpdate = selfUpdate;
            this.selfCommit = selfCommit;
            this.cleanedData = cleanedData;
            return this;
        };

    })();

    // Inject Mixin
    $apy.components.ComponentMixin.call(
        $apy.components.fields.FieldMixin.prototype
    );

})( apy );
