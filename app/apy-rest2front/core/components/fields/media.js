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
     * Apy Media Field
     *
     * A Media type shall be any type of Resource (music, picture, video, ...)
     *
     * @class apy.components.fields.Media
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
    $apy.components.fields.Media = (function Media() {
        /**
         * Media field string representation
         *
         * @memberOf apy.components.fields.Media
         *
         * @return {string} Media field string representation
         */
        function toString() {
            return this.$value.toString();
        }

        /**
         * Get cleaned data
         *
         * @memberOf apy.components.fields.Media
         *
         * @return {null|Object} Either null or a wrapped file object
         */
        function cleanedData() {
            this.validate();
            return this.$value.cleanedData();
        }

        /**
         * Media field - clone a value
         *
         * @memberOf apy.components.fields.Media
         *
         * @param {string|apy.helpers.MediaFile} value Either a string or wrapped file
         *
         * @return {apy.helpers.MediaFile} cloned value
         */
        function cloneValue(value) {
            if (value instanceof $apy.helpers.MediaFile) {
                value = value.getInfo();
            }
            return new $apy.helpers.MediaFile(this.$endpoint, value);
        }

        /**
         * Override parent property to specified validation behaviour.
         *
         * @memberOf apy.components.fields.Media
         */
        function validate() {}

        /**
         * Return true if original value has changed from current one.
         * In other words, if $lastModifiedDate is different from original value
         *
         * @memberOf apy.components.fields.Media
         *
         * @return {boolean} Is the String field updated ?
         */
        function hasUpdated() {
            function getTime(value) {
                var $value;
                if (value && value.getTime) {
                    $value = value.getTime();
                }
                return $value;
            }
            return getTime(this.$memo.$lastModifiedDate) !==
                getTime(this.$value.$lastModifiedDate);
        }

        /**
         * Reset inner value to its original value ($memo) if different
         *
         * @memberOf apy.components.fields.Media
         *
         * @return {apy.components.fields.Media} `this`
         */
        function reset() {
            if (this.hasUpdated()) {
                this.$value = this.cloneValue(this.$memo);
            }
            return this
        }

        return function(service, name, schema, value, $states, $endpoint, type, relationName) {
            this.reset = reset;
            this.validate = validate;
            this.toString = toString;
            this.cloneValue = cloneValue;
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            this.$internalType = 'object';
            this.initialize(service, name, schema, value, $states, $endpoint, $apy.helpers.$TYPES.MEDIA, relationName);
            this.$Class = $apy.components.fields.Media;
            return this;
        };
    })();

    // Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.fields.Media.prototype
    );
    $apy.components.fields.FieldMixin.call(
        $apy.components.fields.Media.prototype
    );
})(apy);
