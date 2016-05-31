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

        function setValue(value) {
            var self = this;
            this.$memo = this.clone(value);
            this.$value = this.clone(value);
            // FIXME: The value is always a list (root)
            // FIXME: Evaluate each element and wrap it with appropriated types.
            // FIXME: Store them into $components.
            // FIXME: Ensure consistency based on schema when possible.
            value && value.forEach && value.forEach(function (el) {
                self.$components.push(el);
            });
            return this;
        }

        /**
         *
         */
        function load (resource) {
            if(!this.$options.schema) {
                return;
            }
            var schema = this.$options.schema;
            var field;
            for (field in schema) {
                if(!schema.hasOwnProperty(field) ||
                    this.continue(field) ||
                    this.continue(field, '$')) {
                    continue;
                }
                var subSchema = schema[field];
                try {
                    var type = subSchema.type;
                    if(!type) continue;
                }
                catch(e) {
                    continue;
                }
                var fieldObj,
                    value = resource[field] || this.$service.$instance.schema2data(subSchema, field);
                switch(type) {
                    case this.$types.LIST:
                        fieldObj = new ApyListField(this.$service, field, value, subSchema, this.$states, this.$endpointBase);
                        break;
                    case this.$types.DICT:
                        fieldObj = new ApyResourceComponent(this.$service, field, subSchema.schema, null, this.$types.RESOURCE, this.$states);
                        fieldObj.load(value);
                        break;
                    case this.$types.MEDIA:
                        fieldObj = new ApyMediaField(this.$service, field, type, value, subSchema, this.$states, this.$endpointBase);
                        break;
                    case this.$types.STRING:
                        fieldObj = new ApyStringField(this.$service, field, type, value, subSchema, this.$states, this.$endpointBase);
                        break;
                    case this.$types.FLOAT:
                    case this.$types.NUMBER:
                    case this.$types.INTEGER:
                        fieldObj = new ApyNumberField(this.$service, field, type, value, subSchema, this.$states, this.$endpointBase);
                        break;
                    case this.$types.BOOLEAN:
                        fieldObj = new ApyBooleanField(this.$service, field, type, value, subSchema, this.$states, this.$endpointBase);
                        break;

                    case this.$types.DATETIME:
                        fieldObj = new ApyDatetimeField(this.$service, field, type, value, subSchema, this.$states, this.$endpointBase);
                        break;
                    case this.$types.OBJECTID:
                        var relationName = subSchema.data_relation.resource;
                        var schemaObject = this.$service.$schemas[relationName];
                        fieldObj = new ApyResourceComponent(this.$service, field, schemaObject, null, this.$types.OBJECTID,
                            this.$states, this.$endpointBase, relationName);
                        fieldObj.load(value);
                        break;
                    default:
                        throw new Error('Unknown type ' + type);
                        break;
                }
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

        return function (service, name, value, options, $states, $endpoint) {
            this.load = load;
            this.clone = clone;
            this.$options = options;
            this.setValue = setValue;
            this.initialize(service, name, $TYPES.LIST, value, options, $states, $endpoint);
            this.load({});

            console.log('LIST.' + this.$name, this);
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyListField.prototype);
    $window.ApyFieldMixin.call(ApyListField.prototype);

})(window);
