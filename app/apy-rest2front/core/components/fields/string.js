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
 *  String field abstraction
 *
 *  """
 */
(function ( $apy ) {

    /**
     * Apy String Field
     *
     * @class apy.components.fields.String
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
    $apy.components.fields.String = function String() {

        /**
         *
         * @returns {*}
         * @memberOf apy.components.fields.String
         */
        function toString() {
            return this.$value;
        }

        /**
         *
         * @returns {*}
         * @memberOf apy.components.fields.String
         */
        function wordCount() {
            return this.$value ? this.$value.length : 0;
        }

        /**
         *
         * @returns {Boolean}
         * @memberOf apy.components.fields.String
         */
        function hasUpdated() {
            this.$value = this.$value || '';
            return this.parentHasUpdated();
        }

        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.$internalType = 'string';
            this.parentHasUpdated = this.hasUpdated;
            this.toString = toString;
            this.wordCount = wordCount;
            this.hasUpdated = hasUpdated;
            this.initialize(service, name, schema, value, $states, $endpoint, $apy.helpers.$TYPES.STRING, relationName);
            this.$Class = $apy.components.fields.String;
            return this;
        };

    }();

    // Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.fields.String.prototype
    );
    $apy.components.fields.FieldMixin.call(
        $apy.components.fields.String.prototype
    );

})( apy );
