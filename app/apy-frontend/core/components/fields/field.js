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
 *  Apy Field Component abstraction
 *
 *  """
 */

(function ($window) {



    // Registering mixin globally
    $window.ApyFieldMixin =  (function () {

        function initialize(service, name, type, value, options, $states, $endpoint) {
            this.init(service, name, type, []);
            this.$name = name;
            this.$type = type;
            this.$states = $states;
            this.$endpoint = $endpoint;
            this.setOptions(options)
                .setValue(value)
                .postInit()
                .validate();
            return this;
        }

        function setOptions(options) {
            options = options || {};
            this.$minlength = options.minlength || this.$minlength;
            this.$maxlength = options.maxlength || this.$maxlength;
            this.$unique = options.unique || this.$unique || false;
            this.$required = options.required || this.$required || false;
            this.$allowed = options.allowed || this.$allowed || [];
            return this;
        }

        function setValue(value) {
            this.$memo = this.clone(value);
            this.$value = this.clone(value);
            return this;
        }

        function needPoly($components) {
            var need = true;
            forEach($components, function (c) {
                if (c.$type === $TYPES.POLY) need = false;
            });
            return need;
        }

        function postInit() {
            return this;
        }

        /**
         *
         * @returns {string}
         */
        function toString() {
            return "" + this.$value;
        }

        /**
         *
         * @param value
         * @returns {*}
         */
        function clone(value) {
            return value;
        }

        /**
         *
         * @returns {this}
         */
        function selfCommit() {
            this.$memo = this.clone(this.$value);
            return this;
        }

        /**
         *
         * @param update
         * @param commit
         * @returns {this}
         */
        function selfUpdate(update, commit) {
            this.$value = this.clone(update.$value);
            if (commit) {
                this.selfCommit();
            }
            return this;
        }

        /**
         *
         */
        function reset() {
            if (this.hasUpdated()) {
                this.$value = this.$memo;
            }
        }

        /**
         *
         * @returns {boolean}
         */
        function hasUpdated() {
            return this.$value !== this.$memo;
        }

        /**
         *
         * @returns {this}
         */
        function validate() {
            var expectedType = this.$type,
                selfType = typeof this.$value,
                error = false;

            if (this.$typesMap.hasOwnProperty(selfType)) {
                var allowedValues = this.$typesMap[selfType];
                if (allowedValues.indexOf(expectedType) > -1) {
                    selfType = expectedType;
                }
            }
            switch (expectedType) {
                case $TYPES.MEDIA:
                case $TYPES.POLYLIST:
                    // FIXME: TBD
                    break;
                case $TYPES.DATETIME:
                    if (!this.$value || isString(this.$value)) {
                        if (this.$value)
                            this.$value = new Date(this.$value);
                        else
                            this.$value = new Date();
                    }
                    if (!isDate(this.$value)) error = true;
                    break;
                default:
                    if (selfType !== expectedType) error = true;
                    break;
            }

            if (error) {
                var e = "Component property `" + this.$name + "` shall be of type => " +
                    expectedType + "! Got " + selfType;
                this.$logging.log(e);
                this.$logging.log(this.$value);
                throw new Error(e);
            }
            return this;
        }

        /**
         *
         */
        function cleanedData() {
            this.validate();
            return this.$value;
        }

        return function () {
            this.clone       = clone;
            this.reset       = reset;
            this.toString    = toString;
            this.needPoly    = needPoly;
            this.validate    = validate;
            this.setValue    = setValue;
            this.postInit    = postInit;
            this.setOptions  = setOptions;
            this.initialize  = initialize;
            this.selfUpdate  = selfUpdate;
            this.selfCommit  = selfCommit;
            this.hasUpdated  = hasUpdated;
            this.clone = clone;
            this.cleanedData = cleanedData;
            return this;
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyFieldMixin.prototype);

})(window);
