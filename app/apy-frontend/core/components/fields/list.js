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
 *  Groups,
 *
 *      - Simple list : known type and/or allowed
 *      - Complex list : unknown type (no type specified in the schema)
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
        function load (resource) {
            resource = resource || {};
            var field = this.$name;
            var schema = this.$options.schema;

            //console.log('LOAD.field', field);
            //console.log('LOAD.schema', schema);

            try {
                var type = schema.type;
                //console.log('LOAD.type', type);
            }
            catch(e) {
                return this;
            }
            var fieldObj,
                value = resource[field] || this.$service.$instance.schema2data(schema, field);
            //value = resource[field];
            //console.log('LOAD.value', value);
            switch(type) {
                case this.$types.LIST:
                    fieldObj = new ApyListField(this.$service, field, value, schema, this.$states, this.$endpointBase);
                    break;
                case this.$types.DICT:
                    //fieldObj = new ApyHashmapField(this.$service, field, this.$types.RESOURCE, value, schema.schema || {}, this.$states, this.$endpointBase);
                    fieldObj = new ApyResourceComponent(this.$service, field, schema.schema, null, this.$types.RESOURCE, this.$states);
                    fieldObj.load(value);
                    if(!schema.schema) {
                        var poly = new ApyPolyField(this.$service, field, value, schema, this.$states, this.$endpointBase);
                        poly.setParent(fieldObj);
                        fieldObj.add(poly);
                    }
                    break;
                case this.$types.MEDIA:
                    fieldObj = new ApyMediaField(this.$service, field, this.$types.MEDIA, value, schema, this.$states, this.$endpointBase);
                    break;
                case this.$types.STRING:
                    fieldObj = new ApyStringField(this.$service, field, this.$types.STRING, value, schema, this.$states, this.$endpointBase);
                    break;
                case this.$types.FLOAT:
                case this.$types.NUMBER:
                case this.$types.INTEGER:
                    fieldObj = new ApyNumberField(this.$service, field, type, value, schema, this.$states, this.$endpointBase);
                    break;
                case this.$types.BOOLEAN:
                    fieldObj = new ApyBooleanField(this.$service, field, this.$types.BOOLEAN, value, schema, this.$states, this.$endpointBase);
                    break;

                case this.$types.DATETIME:
                    fieldObj = new ApyDatetimeField(this.$service, field, this.$types.DATETIME, value, schema, this.$states, this.$endpointBase);
                    break;
                case this.$types.OBJECTID:
                    var relationName = schema.data_relation.resource;
                    var schemaObject = this.$service.$schemas[relationName];
                    //console.log('relationName', relationName);
                    //console.log('schemaObject', schemaObject);
                    fieldObj = new ApyResourceComponent(this.$service, field, schemaObject, null, this.$types.OBJECTID,
                        this.$states, this.$endpointBase, relationName);
                    break;
                default:
                    fieldObj = new ApyPolyField(this.$service, field, value, schema, this.$states, this.$endpointBase);
                    break;
            }
            //console.log('LOAD.fieldObj', fieldObj);
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

        return function (service, name, value, options, $states, $endpoint) {
            this.load = load;
            this.clone = clone;
            //this.setValue = setValue;
            this.initialize(service, name, $TYPES.LIST, value, options, $states, $endpoint);
            this.load();
            //console.log('LIST.' + this.$name, this);
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyListField.prototype);
    $window.ApyFieldMixin.call(ApyListField.prototype);

})(window);
