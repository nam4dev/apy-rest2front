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
 *  Poly-List field(s) abstraction
 *
 *  Groups,
 *
 *      - Simple list : known type and/or allowed
 *      - Complex list : unknown type (no type specified in the schema)
 *
 *  """
 */
(function ($window) {

    $window.ApyPolyListField = function () {

        /**
         *
         * @param value
         * @returns {*}
         */
        function clone(value) {
            return value ? value : [];
        }

        function cleanedData() {
            var cleaned = [];
            this.$components.filter(function (comp) {
                return comp.$type !== $TYPES.POLY
            }).forEach(function (comp) {
                cleaned.push(comp.cleanedData());
            });
            return cleaned;
        }

        function hasUpdated() {
            return this.$components.filter(function (c) {
                    return c.$type !== $TYPES.POLY;
                }).length > 0;
        }

        return function (service, name, listMode, value, options, $states, $endpoint) {
            this.clone = clone;
            this.hasUpdated = hasUpdated;
            this.cleanedData = cleanedData;
            this.postInit = $window.apy.common.postInit;
            this.initialize(service, name, $TYPES.POLYLIST, value, options, $states, $endpoint);
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyPolyListField.prototype);
    $window.ApyFieldMixin.call(ApyPolyListField.prototype);

})(window);
