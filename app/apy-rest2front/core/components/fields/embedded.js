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
 *  `apy-rest2front`  Copyright (C) 2016 Namgyal Brisson.
 */
(function($apy) {
    /**
     * Apy Embedded Field
     *
     * @class apy.components.fields.Embedded
     *
     * @augments apy.components.ComponentMixin
     * @augments apy.components.fields.FieldMixin
     * @augments apy.components.CompositeMixin
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
    $apy.components.fields.Embedded = (function Embedded() {
        /**
         * Embedded field - clone a value
         *
         * @memberOf apy.components.fields.Embedded
         *
         * @param {Object} value A JSON object
         *
         * @return {Object} cloned value
         */
        function cloneValue(value) {
            return $apy.helpers.isObject(value) ? Object.assign(value) : value;
        }

        /**
         * Embedded Field Method to definitely update itself.
         *
         * Reset `$memo` to the current value of `cleanedData()` method.
         * Add current metadata properties as well
         *
         * @override
         * @memberOf apy.components.fields.Embedded
         *
         * @return {apy.components.fields.Embedded} `this`
         */
        function selfCommit() {
            var cleaned = this.parentCleanedData() || {};
            cleaned._id = this._id;
            cleaned._etag = this._etag;
            cleaned._links = this._links;
            cleaned._created = this._created;
            cleaned._updated = this._updated;
            this.$memo = cleaned;
            return this;
        }

        /**
         * Embedded Field Method to update itself.
         *
         * @memberOf apy.components.fields.Embedded
         *
         * @param {Object} update The update payload
         * @param {boolean} commit If true, `selfCommit` method is invoked
         *
         * @return {apy.components.fields.Embedded} `this`
         */
        function selfUpdate(update, commit) {
            this._id = update._id;
            this._etag = update._etag;
            this._links = update._links;
            this._created = update._created;
            this._updated = update._updated;
            this.$components = update.$components || [];
            if (commit) {
                this.selfCommit();
            }
            return this;
        }

        /**
         * Return true if original value has changed from current one.
         * In other words, if inner `_id` (Eve metadata) property
         * is different from the original one.
         *
         * @memberOf apy.components.fields.Embedded
         *
         * @return {boolean} Is the Embedded field updated ?
         */
        function hasUpdated() {
            var updated;
            if (this.$memo && $apy.helpers.isObject(this.$memo)) {
                updated = this.$memo._id !== this._id;
            }
            else {
                updated = this.$memo !== this._id;
            }
            return updated;
        }

        /**
         * Get cleaned data
         *
         * @memberOf apy.components.fields.Embedded
         *
         * @return {string} The Embedded Resource ID
         */
        function cleanedData() {
            return this._id;
        }

        /**
         * @memberOf apy.components.fields.Embedded
         */
        /**
         * Reset inner value to its original value ($memo) if different
         * Reset inner components array.
         *
         * @memberOf apy.components.fields.Embedded
         *
         * @return {apy.components.fields.Embedded} `this`
         */
        function reset() {
            if (this.hasUpdated()) {
                this.$components = [];
                this.load(this.$memo);
            }
            return this;
        }

        /**
         * Override parent property to specified validation behaviour.
         * If no ID found
         *
         * @memberOf apy.components.fields.Embedded
         *
         * @throws {apy.errors.Error} When validation fails
         */
        function validate() {
            var id = this._id;
            if (id === undefined || id === null) {
                var message = 'An Embedded Field should have a non-empty ID[' + typeof id + ']';
                throw new $apy.errors.Error(message);
            }
        }

        /**
         * Set a given value to attribute `$memo`,
         * using `cloneValue` method.
         *
         * Load itself with given value,
         * formatting it to an Object
         *
         * @override
         * @memberOf apy.components.fields.Embedded
         *
         * @param {string|Object} value Either a string representing Resource ID
         * or its representation as a JSON object
         *
         * @returns {apy.components.fields.Embedded} `this`
         */
        function setValue(value) {
            if ($apy.helpers.isString(value)) {
                value = {_id: value};
            }
            this.load(value);
            this.$memo = this.cloneValue(value);
            return this;
        }

        /**
         * Embedded Field String representation
         *
         * @override
         * @memberOf apy.components.fields.Embedded
         *
         * @return {string} Embedded Field string representation
         */
        function toString() {
            if(this.$render) {
                return this.$render(this);
            }
            var str = this.parentToString();
            if (!str && this._id) {
                str = this._id;
            }
            return str;
        }

        /**
         * Apy Embedded Field
         *
         * @constructor
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
        return function(service, name, schema, value, $states, $endpoint, type, relationName) {
            this.reset = reset;
            this.parentToString = this.toString;
            this.toString = toString;
            this.validate = validate;
            this.setValue = setValue;
            this.cloneValue = cloneValue;
            this.hasUpdated = hasUpdated;
            this.selfUpdate = selfUpdate;
            this.selfCommit = selfCommit;
            this.parentCleanedData = this.cleanedData;
            this.cleanedData = cleanedData;
            this.$internalType = 'object';
            this.initialize(service, name, schema, value, $states, $endpoint, $apy.helpers.$TYPES.OBJECTID, relationName);
            this.$Class = $apy.components.fields.Embedded;
            return this;
        };
    })();

    // Inject Mixins
    $apy.components.ComponentMixin.call(
        $apy.components.fields.Embedded.prototype
    );
    $apy.components.fields.FieldMixin.call(
        $apy.components.fields.Embedded.prototype
    );
    $apy.components.CompositeMixin.call(
        $apy.components.fields.Embedded.prototype
    );
})(apy);
