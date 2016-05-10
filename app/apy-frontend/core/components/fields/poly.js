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
(function ($window, $) {

    function getFieldClassByType(type) {
        type = type.capitalize();
        var fieldClassName = 'Apy' + type + 'Field';
        if(!$window.hasOwnProperty(fieldClassName)) return null;
        var f = $window[fieldClassName];
        console.log('Field, ', type, fieldClassName, f);
        return f;
    }

    $window.ApyPolyField = function () {

        var mapping = {
            'float': 'number',
            'integer': 'number',
            'resource': 'Hashmap',
            'objectid': 'Embedded'
        };

        var fields = Object.assign($TYPES);
        forEach($TYPES, function (type) {
            if(['poly', 'poly-list', 'collection'].indexOf(type) === -1) {
                if(mapping.hasOwnProperty(type)) type = mapping[type];
                var cls = getFieldClassByType(type);
                if(cls) fields[type] = cls;
            }
        });

        function setType(parent, type, schemaName) {
            var mappedType = type;
            if(mapping.hasOwnProperty(type)) {
                mappedType = mapping[type];
            }
            if(['float', 'integer'].indexOf(type) !== -1) type = mappedType;
            $.extend(true, this, new fields[mappedType](this.$service, null, type, null,
                this.$service.$schemas[schemaName], this.$states, this.$endpoint));
            if (this.needPoly(parent.$components)) {
                parent.$components.push(new ApyPolyField(this.$service, null, null, {},
                    this.$states, this.$endpoint));
            }

        }

        var typeWrapper = function(value) {
            switch (this.$type) {
                case $TYPES.MEDIA:
                    return new ApyMediaFile(this.$endpoint, value);
                default :
                    return value;
            }
        };

        return function (service, name, value, options, $states, $endpoint) {
            this.setType = setType;
            this.typeWrapper = typeWrapper;
            this.initialize(service, name, $window.$TYPES.POLY, value, options, $states, $endpoint);
            return this;
        }

    }();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyPolyField.prototype);
    $window.ApyFieldMixin.call(ApyPolyField.prototype);

})(window, window.jQuery);
