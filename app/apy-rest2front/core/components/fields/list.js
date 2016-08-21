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
 */
(function($apy) {
    /**
     * Apy List Field
     *
     * @class apy.components.fields.List
     *
     * @augments apy.components.ComponentMixin
     * @augments apy.components.fields.FieldMixin
     * @augments apy.components.RequestMixin
     * @augments apy.components.CompositeMixin
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
    $apy.components.fields.List = function List() {
        /**
         * Set a given value to attributes
         * `$value` & `$memo` respectively,
         * using `cloneValue` method
         *
         * Load each inner component with given value
         *
         * @override
         * @memberOf apy.components.fields.List
         *
         * @param {Array} value An Array instance representing a List of Resources
         *
         * @returns {apy.components.fields.List} `this`
         */
        function setValue(value) {
            var self = this;
            this.$memo = 0;
            this.$memoValue = this.cloneValue(value);
            this.$value = this.cloneValue(value);
            // Reset components
            this.$components = [];
            if (Array.isArray(value)) {
                value.forEach(function(el) {
                    self.load(el);
                });
            }
            this.$memo = this.$components.length;
            return this;
        }

        /**
         * Load each value contained into inner `$value` prop,
         * into a matching Apy Field based on its schema.
         *
         * **If no schema is specified, an `apy.components.fields.Poly` is created**
         *
         * @override
         * @memberOf apy.components.fields.List
         *
         * @param {*} val (optional) value matching schema type
         *
         * @return {apy.components.fields.List} `this`
         */
        function load(val) {
            var type;
            try {
                type = this.$schema.schema.type;
            }
            catch (e) {
                type = null;
            }
            this.$$createField(type, this.$name, this.$schema.schema, val || this.$value, this.$endpoint, true);
            return this;
        }

        /**
         * Reset inner value to its original value ($memoValue) if different
         *
         * @memberOf apy.components.fields.List
         *
         * @return {apy.components.fields.List} `this`
         */
        function reset() {
            this.setValue(this.$memoValue);
            return this;
        }

        /**
         * List field - clone a value
         *
         * @memberOf apy.components.fields.List
         *
         * @param {Array} value A list array
         *
         * @return {Array} cloned value
         */
        function cloneValue(value) {
            value = value ? value : [];
            if (!Array.isArray(value)) {
                value = new Array(value);
            }
            return value;
        }

        /**
         * Return true if original value has changed from current one.
         * In other words, if inner components count has changed or if any
         * contained component is updated.
         *
         * @memberOf apy.components.fields.List
         *
         * @return {boolean} Is the List field updated ?
         */
        function hasUpdated() {
            var updated = false;
            if (this.$memo !== this.$components.length) {
                updated = true;
            }
            if (!updated) {
                this.$components.forEach(function(comp) {
                    if (comp.hasUpdated()) {
                        updated = true;
                    }
                });
            }
            return updated;
        }

        /**
         * Get cleaned data
         *
         * @memberOf apy.components.fields.List
         *
         * @return {Array} An Array List
         */
        function cleanedData() {
            this.validate();
            if (this.$allowed && this.$allowed.length &&
                this.$value && this.$value.length) {
                return this.$value;
            }
            var data = [];
            this.$components.forEach(function(comp) {
                var cleaned = comp.cleanedData();
                if (cleaned || cleaned === false || cleaned === 0) {
                    data.push(cleaned);
                }
            });
            return data;
        }

        /**
         * Override parent property to specified validation behaviour.
         *
         * @memberOf apy.components.fields.List
         *
         * @throws {apy.errors.Error} When validation fails
         */
        function validate() {
            this.parentValidate();
            this.$components.forEach(function(comp) {
                comp.validate();
            });
        }

        /**
         * List Field Method to update itself.
         *
         * Reset `$memo` to the current components count
         * Call each inner component `selfCommit` method
         *
         * @override
         * @memberOf apy.components.fields.List
         *
         * @return {apy.components.fields.List} `this`
         */
        function selfCommit() {
            this.$memo = this.$components.length;
            this.$components.forEach(function(comp) {
                comp.selfCommit();
            });
            return this;
        }

        return function(service, name, schema, value, $states, $endpoint, type, relationName) {
            this.load = load;
            this.reset = reset;
            this.parentValidate = this.validate;
            this.validate = validate;
            this.setValue = setValue;
            this.selfCommit = selfCommit;
            this.cloneValue = cloneValue;
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            this.$internalType = 'object';
            this.$memoValue = [];
            this.initialize(service, name, schema, value, $states, $endpoint, $apy.helpers.$TYPES.LIST, relationName);
            this.$Class = $apy.components.fields.List;
            return this;
        };
    }();

    // Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.fields.List.prototype
    );
    $apy.components.fields.FieldMixin.call(
        $apy.components.fields.List.prototype
    );
    $apy.components.RequestMixin.call(
        $apy.components.fields.List.prototype
    );
    $apy.components.CompositeMixin.call(
        $apy.components.fields.List.prototype
    );
})(apy);
