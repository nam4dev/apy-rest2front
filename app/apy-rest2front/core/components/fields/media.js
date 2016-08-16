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
 *  Media field abstraction
 *  A Media type shall be any type of Resource (music, picture, video, ...)
 *
 *  """
 */
(function ( $apy ) {

    /**
     * Apy Media Field
     *
     * @class apy.components.fields.Media
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
    $apy.components.fields.Media = (function Media() {

        /**
         *
         * @returns {*}
         * @memberOf apy.components.fields.Media
         */
        function toString() {
            return this.$value.toString();
        }

        /**
         *
         * @returns {*}
         * @memberOf apy.components.fields.Media
         */
        function cleanedData() {
            this.validate();
            return this.$value.cleanedData();
        }

        /**
         *
         * @param value
         * @returns {*|apy.helpers.MediaFile}
         * @memberOf apy.components.fields.Media
         */
        function cloneValue(value) {
            if(value instanceof $apy.helpers.MediaFile) {
                value = value.getInfo();
            }
            return new $apy.helpers.MediaFile(this.$endpoint, value);
        }

        // FIXME
        /**
         * @memberOf apy.components.fields.Media
         */
        function validate() {}

        /**
         *
         * @returns {boolean}
         * @memberOf apy.components.fields.Media
         */
        function hasUpdated() {
            function getTime(value) {
                var $value;
                if(value && value.getTime) {
                    $value = value.getTime();
                }
                return $value;
            }
            return getTime(this.$memo.$lastModifiedDate) !==
                getTime(this.$value.$lastModifiedDate);
        }

        /**
         * @memberOf apy.components.fields.Media
         */
        function reset() {
            if (this.hasUpdated()) {
                this.$value = this.cloneValue(this.$memo);
            }
        }

        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
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

})( apy );
