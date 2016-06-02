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

        //function setValue(value) {
        //    var self = this;
        //    this.$memo = this.clone(value);
        //    this.$value = this.clone(value);
        //    value && value.forEach && value.forEach(function (el) {
        //        self.$components.push(el);
        //    });
        //    return this;
        //}

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
                //console.log('LOAD.type', e);
            }
            var fieldObj,
                value = resource[field] || this.$service.$instance.schema2data(schema, field);
            switch(type) {
                case this.$types.LIST:
                    fieldObj = new ApyListField(this.$service, field, schema, value, this.$states, this.$endpoint);
                    break;
                case this.$types.DICT:
                    //fieldObj = new ApyHashmapField(this.$service, field, schema.schema || {}, value, this.$states, this.$endpoint);
                    fieldObj = new ApyResourceComponent(this.$service, field, schema.schema, null, this.$states, null, this.$types.RESOURCE);
                    fieldObj.load(value);
                    if(!schema.schema) {
                        var poly = new ApyPolyField(this.$service, field, schema, value, this.$states, this.$endpoint);
                        poly.setParent(fieldObj);
                        fieldObj.add(poly);
                    }
                    break;
                case this.$types.MEDIA:
                    fieldObj = new ApyMediaField(this.$service, field, schema, value, this.$states, this.$endpoint);
                    break;
                case this.$types.STRING:
                    fieldObj = new ApyStringField(this.$service, field, schema, value, this.$states, this.$endpoint);
                    break;
                case this.$types.FLOAT:
                case this.$types.NUMBER:
                case this.$types.INTEGER:
                    fieldObj = new ApyNumberField(this.$service, field, schema, value, this.$states, this.$endpoint);
                    break;
                case this.$types.BOOLEAN:
                    fieldObj = new ApyBooleanField(this.$service, field, schema, value, this.$states, this.$endpoint);
                    break;

                case this.$types.DATETIME:
                    fieldObj = new ApyDatetimeField(this.$service, field, schema, value, this.$states, this.$endpoint);
                    break;
                case this.$types.OBJECTID:
                    var relationName = schema.data_relation.resource;
                    var schemaObject = this.$service.$schemas[relationName];
                    fieldObj = new ApyEmbeddedField(this.$service, field, schemaObject, null,
                        this.$states, this.$endpoint, this.$types.OBJECTID, relationName);
                    break;
                default:
                    fieldObj = new ApyPolyField(this.$service, field, schema, value, this.$states, this.$endpoint);
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
        function clone(value) {
            return value ? value : [];
        }

        function hasPoly() {
            var result = false;
            this.$components.forEach(function (comp) {
                if(comp.$type === comp.$types.POLY) {
                    result = true;
                }
            });
            return result;
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
            this.hasPoly = hasPoly;
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            //this.setValue = setValue;
            this.initialize(service, name, schema, value, $states, $endpoint, $TYPES.LIST, null);
            this.load();
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyListField.prototype);
    $window.ApyFieldMixin.call(ApyListField.prototype);

})(window);
