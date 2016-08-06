/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy Frontend.
 *  For UI components (data representation & bindings), AngularJs is used.
 *  Anyhow, the framework is intended to be plugged to any UI or Backend framework...
 *
 *  Copyright (C) 2016 Namgyal Brisson
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
 *  `apy-frontend`  Copyright (C) 2016 Namgyal Brisson.
 *
 *  """
 *  Write here what the module does...
 *
 *  """
 */
(function ($window) {

    $window.ApyEmbeddedField = (function () {

        function cloneValue(value) {
            return isObject(value) ? Object.assign(value) : value;
        }

        function selfCommit() {
            var cleaned = this.cleanedData();
            cleaned._id = this._id;
            cleaned._etag = this._etag;
            cleaned._links = this._links;
            cleaned._created = this._created;
            cleaned._updated = this._updated;
            this.$memo = cleaned;
        }

        function selfUpdate(update, commit) {
            this._id = update._id;
            this._etag = update._etag;
            this._links = update._links;
            this._created = update._created;
            this._updated = update._updated;
            this.$components = update.$components || [];
            this.loadValue();
            return this;
        }

        function hasUpdated () {
            var updated;
            if(this.$memo && this.$memo._id) {
                updated = this.$memo._id !== this._id;
            }
            else {
                updated = this.$memo !== this._id;
            }
            return updated;
        }

        function cleanedData () {
            return this._id;
        }

        /**
         *
         */
        function reset() {
            if (this.hasUpdated()) {
                this.$components = [];
                this.load(this.$memo);
            }
        }

        function validate() {
            var id = this._id;
            if(id === undefined || id === null) {
                var message = 'An Embedded Field should have a non-empty ID[' + typeof id + ']';
                throw new ApyError(message);
            }
        }

        function setValue(value) {
            if(isString(value)) {
                value = {_id: value};
            }
            this.load(value);
            this.$memo = this.cloneValue(value);
            return this;
        }

        return function (service, name, schema, value, $states, $endpoint, type, relationName) {
            this.reset = reset;
            this.validate = validate;
            this.setValue = setValue;
            this.cloneValue = cloneValue;
            this.hasUpdated = hasUpdated;
            this.selfUpdate = selfUpdate;
            this.selfCommit = selfCommit;
            this.cleanedData = cleanedData;
            this.$internalType = 'object';
            this.initialize(service, name, schema, value, $states, $endpoint, $window.$TYPES.OBJECTID, relationName);
            this.$Class = $window.ApyEmbeddedField;
            return this;
        }

    })();

    // Inject Mixins
    $window.ApyComponentMixin.call(ApyEmbeddedField.prototype);
    $window.ApyFieldMixin.call(ApyEmbeddedField.prototype);
    $window.ApyCompositeMixin.call(ApyEmbeddedField.prototype);

})(window);
