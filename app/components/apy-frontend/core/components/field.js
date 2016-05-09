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
 *  Write here what the module does...
 *
 *  """
 */

(function ($window) {

    // Registering mixin globally
    $window.ApyFieldMixin =  (function () {

        function initialize(name, type, value, options, $states, $endpoint) {

            this.init(name, type, []);

            this.$name = name;
            this.$type = type;
            this.$states = $states;
            this.$endpoint = $endpoint;

            this.setOptions(options)
                .setValue(value)
                .postInit();
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
            // FIXME: The han is biting it own tail
            // FIXME: This.$value needs to be called before (validate) super
            // FIXME: and after (ApyMediaFile) according to case
            // FIXME: Refactor ApyMediaFile not to be dependant of IComponent inheritance
            this.$memo = this.clone(value);
            this.$value = this.typeWrapper(value);
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
            switch (this.$type) {
                case this.$types.LIST:
                case this.$types.DICT:
                case this.$types.RESOURCE:
                    this.$components = [];
                    var poly = new ApyFieldComponent(null, $TYPES.POLY, null, {}, this.$states, this.$endpoint);
                    this.$components.push(poly);
                    break;
                default :
                    break;
            }
            return this;
        }

        function setType(parent, type, schemaName) {
            this.$type = type;
            if (this.$typesForPoly.indexOf(type) !== -1) {
                if (this.$fieldTypesMap.hasOwnProperty(type)) {
                    type = this.$fieldTypesMap[type];
                }
                if (type !== this.$types.DICT) this.$contentUrl = 'field-' + type + '.html';
            }
            if (needPoly(parent.$components)) {
                var poly;
                switch (type) {
                    case this.$types.DICT:
                        poly = new ApyFieldComponent(null, this.$types.RESOURCE, null, {}, this.$states, this.$endpoint);
                        parent.$components.push(poly);
                        return this;
                    case this.$types.OBJECTID:
                        poly = new ApyResourceComponent(null,
                            service.$schemas[schemaName],
                            null, this.$types.OBJECTID, this.$states, this.$endpoint, schemaName);
                        //poly.load();
                        parent.$components.push(poly);
                        break;
                    default :
                        parent.$components.push(
                            new ApyFieldComponent(null, $TYPES.POLY, null, {}, this.$states, this.$endpoint));
                        return this.initialize();
                }
            }

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
        function typeWrapper(value) {
            switch (this.$type) {
                case this.$types.LIST:
                    return value ? value : [];
                case this.$types.MEDIA:
                    return new ApyMediaFile(this.$endpoint, value);
                case this.$types.DATETIME:
                    return new Date(value);
                default :
                    return value;
            }
        }

        /**
         *
         * @param value
         * @returns {*}
         */
        function clone(value) {
            switch (this.$type) {
                case this.$types.LIST:
                case this.$types.MEDIA:
                case this.$types.STRING:
                case this.$types.INTEGER:
                case this.$types.DATETIME:
                    return this.typeWrapper(value);
                case this.$types.DICT:
                    return isObject(value) ? Object.assign(value) : value;
                default :
                    return value;
            }
        }

        /**
         *
         * @returns {ApyFieldComponent}
         */
        function selfCommit() {
            this.$memo = this.clone(this.$value);
            return this;
        }

        /**
         *
         * @param update
         * @param commit
         * @returns {ApyFieldComponent}
         */
        function selfUpdate(update, commit) {
            this.$value = this.typeWrapper(update.$value);
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
            var hasUpdated = false;
            switch (this.$type) {
                case this.$types.LIST:
                    hasUpdated = this.$components.filter(function (c) {
                            return c.$type !== 'ployMorph';
                        }).length > 0;
                    break;
                case this.$types.DATETIME:
                    if (!isDate(this.$memo)) this.$memo = new Date(this.$memo);
                    hasUpdated = this.$value.getTime() !== this.$memo.getTime();
                    break;
                default :
                    hasUpdated = this.$value !== this.$memo;
                    break;
            }
            return hasUpdated;
        }

        /**
         *
         * @returns {ApyFieldComponent}
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
                case this.$types.MEDIA:
                    break;
                case this.$types.DATETIME:
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

                // FIXME: The han is biting it own tail
                // FIXME: This.$value needs to be called before (validate) super
                // FIXME: and after (ApyMediaFile) according to case
                // FIXME: Refactor ApyMediaFile not to be dependant of IComponent inheritance
                this.$logging.log(e);
                this.$logging.log(this.$value);
                //throw new Error(e);
            }
            return this;
        }

        /**
         *
         */
        function cleanedData() {
            var cleaned;
            this.validate();
            switch (this.$type) {
                case this.$types.DICT:
                case this.$types.RESOURCE:
                    cleaned = {};
                    this.$components.filter(function (comp) {
                        return comp.$type !== $TYPES.POLY
                    }).forEach(function (comp) {
                        cleaned[comp.$name] = comp.cleanedData();
                    });
                    return cleaned;
                case this.$types.LIST:
                    cleaned = [];
                    this.$components.filter(function (comp) {
                        return comp.$type !== $TYPES.POLY
                    }).forEach(function (comp) {
                        cleaned.push(comp.cleanedData());
                    });
                    return cleaned;
                case this.$types.MEDIA:
                    return this.$value.cleanedData();
                case this.$types.DATETIME:
                    return this.$value.toUTCString();
                default :
                    return this.$value;
            }
        }

        return function (name, type, value, options, $states, $endpoint) {
            this.clone       = clone;
            this.reset       = reset;
            this.setType     = setType;
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
            this.typeWrapper = typeWrapper;
            this.cleanedData = cleanedData;

            this.initialize(name, type, value, options, $states, $endpoint);
            return this;
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyFieldMixin.prototype);

})(window);
