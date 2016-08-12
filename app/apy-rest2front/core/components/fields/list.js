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
 *  List field(s) abstraction
 *
 *  """
 */
(function ($globals) {

    $globals.ApyListField = function () {

        function setValue(value) {
            var self = this;
            this.$memo = 0;
            this.$memoValue = this.cloneValue(value);
            this.$value = this.cloneValue(value);
            // Reset components
            this.$components = [];
            if(Array.isArray(value)) {
                value.forEach(function (el) {
                    self.load(el);
                });
            }
            this.$memo = this.$components.length;
            return this;
        }

        /**
         *
         */
        function load (val) {
            var type;
            var value = val || this.$value || {};
            var schema = this.$schema.schema;
            try {
                type = schema.type;
            }
            catch(e) {
                schema = {};
            }
            this.$$createField(type, this.$name, schema, value, this.$endpoint, true);
            return this;
        }

        /**
         *
         * @returns {*}
         */
        function reset() {
            this.setValue(this.$memoValue);
        }

        /**
         *
         * @param value
         * @returns {*}
         */
        function cloneValue(value) {
            value = value ? value : [];
            if(!Array.isArray(value)) {
                value = new Array(value);
            }
            return value;
        }

        /**
         *
         * @returns {boolean}
         */
        function hasUpdated () {
            var updated = false;
            if(this.$memo !== this.$components.length) {
                updated = true;
            }
            if(!updated) {
                this.$components.forEach(function (comp) {
                    if(comp.hasUpdated()) {
                        updated = true;
                    }
                });
            }
            return updated;
        }

        /**
         *
         * @returns {Array}
         */
        function cleanedData () {
            this.validate();
            if(this.$allowed && this.$allowed.length &&
                this.$value && this.$value.length) {
                return this.$value;
            }
            var data = [];
            this.$components.forEach(function (comp) {
                var cleaned = comp.cleanedData();
                if(cleaned || cleaned === false || cleaned === 0) {
                    data.push(cleaned);
                }
            });
            return data;
        }

        /**
         *
         */
        function validate() {
            this.parentValidate();
            this.$components.forEach(function (comp) {
                comp.validate();
            });
        }

        /**
         *
         * @returns {string}
         */
        function selfCommit() {
            this.$memo = this.$components.length;
            this.$components.forEach(function (comp) {
                comp.selfCommit();
            });
        }

        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
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
            this.initialize(service, name, schema, value, $states, $endpoint, $globals.$TYPES.LIST, relationName);
            this.$Class = $globals.ApyListField;
            return this;
        };

    }();

    // Inject Mixins
    $globals.ApyComponentMixin.call(ApyListField.prototype);
    $globals.ApyFieldMixin.call(ApyListField.prototype);
    $globals.ApyRequestMixin.call(ApyListField.prototype);
    $globals.ApyCompositeMixin.call(ApyListField.prototype);

})( this );
