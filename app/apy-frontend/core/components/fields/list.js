/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy Frontend.
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
 *  `apy-frontend`  Copyright (C) 2016  (apy) Namgyal Brisson.
 *
 *  """
 *  List field(s) abstraction
 *
 *  """
 */
(function ($window) {

    $window.ApyListField = function () {

        function setValue(value) {
            var self = this;
            this.$memo = this.clone(value);
            this.$value = this.clone(value);
            value && value.forEach && value.forEach(function (el) {
                self.$components.push(el);
            });
            return this;
        }

        /**
         *
         */
        function load () {
            var resource = this.$value || {};
            var type;
            var field = this.$name;
            var schema = this.$schema.schema;
            try {
                type = schema.type;
            }
            catch(e) {
                schema = {};
            }
            var fieldObj,
                value = resource[field] || this.$service.$instance.schema2data(schema, field);
            switch(type) {
                case $TYPES.LIST:
                case $TYPES.DICT:
                case $TYPES.MEDIA:
                case $TYPES.STRING:
                case $TYPES.FLOAT:
                case $TYPES.NUMBER:
                case $TYPES.INTEGER:
                case $TYPES.BOOLEAN:
                case $TYPES.DATETIME:
                case $TYPES.OBJECTID:
                    break;
                default:
                    fieldObj = new ApyPolyField(this.$service, field, schema, value, this.$states, this.$endpoint);
                    break;
            }
            if(fieldObj) {
                fieldObj.setParent(this);
                this.add(fieldObj);
            }

            return this;
        }

        /**
         *
         * @param value
         * @returns {*}
         */
        function clone(value) {
            return value ? value : [];
        }

        /**
         *
         * @returns {boolean}
         */
        function hasUpdated () {
            var updated = false;
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated()) updated = true;
            });
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
            this.$components.filter(function (comp) {
                return comp.$type !== $TYPES.POLY
            }).forEach(function (comp) {
                data.push(comp.cleanedData());
            });
            return data;
        }


        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.load = load;
            this.clone = clone;
            //this.setValue = setValue;
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            this.$Class = $window.ApyListField;
            this.initialize(service, name, schema, value, $states, $endpoint, $TYPES.LIST, relationName);
            this.load();
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyListField.prototype);
    $window.ApyFieldMixin.call(ApyListField.prototype);

})(window);
