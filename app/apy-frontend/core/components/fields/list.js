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
            this.$memo = 0;
            this.$value = this.cloneValue(value);
            if(value && value.forEach) {
                // Reset components
                this.$components = [];
                value.forEach(function (el) {
                    self.load(el);
                });
                this.$memo = this.$components.length;
            }
            return this;
        }

        /**
         *
         */
        function load (val) {
            var resource = val || this.$value || {};
            var type;
            var field = this.$name;
            var schema = this.$schema.schema;

            try {
                type = schema.type;
            }
            catch(e) {
                schema = {};
            }
            var fieldObj;
            switch(type) {
                case this.$types.LIST:
                    fieldObj = new ApyListField(this.$service, field, schema, resource, this.$states, this.$endpoint);
                    break;
                case this.$types.DICT:
                    fieldObj = new ApyResourceComponent(this.$service, field, schema.schema, null, this.$states, null, this.$types.RESOURCE);
                    fieldObj.load(resource);
                    if(!schema.schema) {
                        fieldObj.add(this.createPolyField(schema, resource));
                    }
                    break;
                case this.$types.MEDIA:
                    fieldObj = new ApyMediaField(this.$service, field, schema, resource, this.$states, this.$endpoint);
                    break;
                case this.$types.STRING:
                    fieldObj = new ApyStringField(this.$service, field, schema, resource, this.$states, this.$endpoint);
                    break;
                case this.$types.FLOAT:
                case this.$types.NUMBER:
                case this.$types.INTEGER:
                    fieldObj = new ApyNumberField(this.$service, field, schema, resource, this.$states, this.$endpoint);
                    break;
                case this.$types.BOOLEAN:
                    fieldObj = new ApyBooleanField(this.$service, field, schema, resource, this.$states, this.$endpoint);
                    break;

                case this.$types.DATETIME:
                    fieldObj = new ApyDatetimeField(this.$service, field, schema, resource, this.$states, this.$endpoint);
                    break;
                case this.$types.OBJECTID:
                    var relationName = schema.data_relation.resource;
                    var schemaObject = this.$service.$schemas[relationName];
                    fieldObj = new ApyEmbeddedField(this.$service, field, schemaObject, resource,
                        this.$states, this.$endpoint, this.$types.OBJECTID, relationName);
                    break;
                default:
                    fieldObj = this.createPolyField(schema, resource);
                    break;
            }
            fieldObj.setParent(this);
            this.add(fieldObj);
            return this;
        }

        /**
         *
         * @param value
         * @returns {*}
         */
        function cloneValue(value) {
            return value ? value : [];
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
                    if(comp.hasUpdated()) updated = true;
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
                data.push(comp.cleanedData());
            });
            return data;
        }

        function validate() {

        }

        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.validate = validate;
            this.load = load;
            this.setValue = setValue;
            this.cloneValue = cloneValue;
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            this.$Class = $window.ApyListField;
            this.initialize(service, name, schema, value, $states, $endpoint, $TYPES.LIST, relationName);
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyListField.prototype);
    $window.ApyFieldMixin.call(ApyListField.prototype);

})(window);
