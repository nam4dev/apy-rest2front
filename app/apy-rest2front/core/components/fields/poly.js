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
(function($apy, $) {
    /**
     * Apy Poly(morph) Field
     *
     * It converts itself to any known types
     *
     * @class apy.components.fields.Poly
     *
     * @augments apy.components.ComponentMixin
     * @augments apy.components.fields.FieldMixin
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
    $apy.components.fields.Poly = function Poly() {
        var fieldClassByType = $apy.helpers.fieldClassByType;

        /**
         * Type setter.
         *
         * Allow the Polymorph field to `morphs` to another type.
         *
         * @memberOf apy.components.fields.Poly
         *
         * @param {string} type Field type
         * @param {string} schemaName Backend Resource schema name
         */
        function setType(type, schemaName) {
            var field = fieldClassByType(type);
            if (!field) {
                throw new $apy.errors.Error('Unknown Field type, **' + type + '**');
            }
            var schema = schemaName ? this.$service.$schemas[schemaName] : null;
            var instance = new field(this.$service, null, schema, null,
                this.$states, this.$endpoint, type, this.$relationName);

            if (this.$value && this.$value.forEach) {
                this.$value.forEach(function(comp) {
                    instance.add(comp);
                });
            }
            var v = this.$value;
            v && instance.setValue(v);
            $.extend(true, this, instance);
            /* istanbul ignore next */
            if (!this.$parent) {
                console.debug('No Parent provided for ' +
                    'Poly.setType(parent= undefined, type=',
                    type, ', schemaName=', schemaName);
            }
            switch (type) {
            case $apy.helpers.$TYPES.RESOURCE:
                this.add(this.createPolyField({}, null));
                break;
            default:
                break;
            }
        }

        /**
         * Override parent property to disabled validation.
         * Polymorph field cannot be validated as no schema is provided.
         * No choice but to tell the user to use this to its own risks.
         *
         * @memberOf apy.components.fields.Poly
         */
        function validate() {}

        /**
         * Poly field string representation
         *
         * @memberOf apy.components.fields.Poly
         *
         * @return {string} Poly field string representation
         */
        function toString() {
            return this.$value;
        }

        // FIXME: value & options parameters shall not be useful as a Poly Morph Field
        // FIXME: should not care of schema/options and value except if we decide to try to
        // FIXME: autodetect type based on given value when we've got a schema-less field (which Poly certainly is).
        return function(service, name, schema, value, $states, $endpoint, type, relationName) {
            this.setType = setType;
            this.validate = validate;
            this.toString = toString;
            // Allow to know, this field is a PolyMorph type as it is the only one to have this property,
            // as when setType is invoked, its type is entirely overridden with all similar properties.
            this.$isPolyMorph = true;
            this.initialize(service, name, schema, value, $states, $endpoint, $apy.helpers.$TYPES.POLY, relationName);
            this.$Class = $apy.components.fields.Poly;
            return this;
        };
    }();

    // Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.fields.Poly.prototype
    );
    $apy.components.fields.FieldMixin.call(
        $apy.components.fields.Poly.prototype
    );
})(apy, window.jQuery);
