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
 *  Poly Morph Field
 *
 *  It converts itself to any known types
 *
 *  """
 */
(function ($window, $) {

    $window.ApyPolyField = function () {

        var mapping = $window.apy.common.typesMapping;
        var fieldClassByType = $window.apy.common.fieldClassByType;

        function setType(type, schemaName) {
            var mappedType = type;
            if(mapping.hasOwnProperty(type)) {
                mappedType = mapping[type];
            }
            if(['float', 'integer'].indexOf(type) !== -1) type = mappedType;
            //console.log('fields', fields);
            //console.log('mappedType', mappedType);
            //console.log('fields[mappedType]', fields[mappedType]);
            var field = fieldClassByType(type);
            if(!field) {
                throw new Error('Unknown Field type, **' + type + '**');
            }
            $.extend(true, this, new field(this.$service, null, type, null,
                this.$service.$schemas[schemaName], this.$states, this.$endpoint));
            if(!this.$parent) {
                console.log('No Parent provided for ' +
                    'ApyPolyField.setType(parent= undefined, type=',
                    type, ', schemaName=', schemaName);
            }
            else {
                //console.log('PARENT', this.$parent)
            }
            if (this.$parent && this.$parent.needPoly()) {
                var poly = new ApyPolyField(this.$service, null, null, {},
                    this.$states, this.$endpoint);
                poly.setParent(this.$parent);
                this.$parent.add(poly);
            }
        }

        var clone = function(value) {
            switch (this.$type) {
                case $TYPES.MEDIA:
                    return new ApyMediaFile(this.$endpoint, value);
                default :
                    return value;
            }
        };

        function hasPoly() {
            return true;
        }

        // FIXME: value & options parameters shall not be useful as a Poly Morph Field
        // FIXME: should not care of schema/options and value except if we decide to try to
        // FIXME: autodetect type based on given value when we've got a schema-less field (which PolyField certainly is).
        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.hasPoly = hasPoly;
            this.setType = setType;
            this.clone = clone;
            this.initialize(service, name, schema, value, $states, $endpoint, $window.$TYPES.POLY, null);
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyPolyField.prototype);
    $window.ApyFieldMixin.call(ApyPolyField.prototype);

})(window, window.jQuery);
