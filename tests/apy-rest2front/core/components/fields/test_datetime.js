/**
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
 *
 *  """
 *  Datetime Field UTs
 *
 *  """
 */

describe("Component.Field.Datetime unit tests", function() {

    //var _createFieldByType = function (type, value, schema) {
    //    schema = schema || {};
    //    schema.type = type;
    //    return new window['Apy' + type.capitalize() + 'Field']({$log: console}, type + ".test", schema, value);
    //};

    var _createField = function (value, schema) {
        return new apy.tests.createFieldByType('datetime', value, schema);
    };

    it("[setValue] Valid value", function() {
        var value = new Date();
        var field = _createField(value);
        expect(field.$value).toBeDefined();
        expect(field.$value.toUTCString).toBeDefined();
        expect(field.$memo).toBeDefined();
        expect(field.$memo.toUTCString).toBeDefined();
        expect(field.$value.toUTCString()).toEqual(value.toUTCString());
        expect(field.$value.toUTCString()).toEqual(field.$memo.toUTCString());
    });

    it("[cleanedData] shall return an UTC string", function() {
        var value = new Date();
        var field = _createField(value);
        expect(field.cleanedData()).toEqual(value.toUTCString());
    });

    it("[cloneValue.Null.input] shall return a Date object", function() {
        var value = null;
        var field = _createField(value);
        var clonedValue = field.cloneValue(value);
        expect(apy.tests.helper.isDate(clonedValue)).toBe(true);
    });

    it("[cloneValue.Undefined.input] shall return a Date object", function() {
        var value = undefined;
        var field = _createField(value);
        var clonedValue = field.cloneValue(value);
        expect(apy.tests.helper.isDate(clonedValue)).toBe(true);
    });

    it("[cloneValue.String.input] shall return an equal Date object", function() {
        var value = new Date();
        var field = _createField(null);
        var clonedValue = field.cloneValue(value.toUTCString());
        expect(apy.tests.helper.isDate(clonedValue)).toBe(true);
        expect(clonedValue.toUTCString()).toEqual(value.toUTCString());
    });

    it("[cloneValue.Date.input] shall return an equal Date object", function() {
        var value = new Date();
        var field = _createField(null);
        var clonedValue = field.cloneValue(value);
        expect(apy.tests.helper.isDate(clonedValue)).toBe(true);
        expect(clonedValue.toUTCString()).toEqual(value.toUTCString());
    });

    it("[cloneValue.Bad.input] shall throw an Error", function() {
        var field = _createField(null);
        function wrapper() {
            field.cloneValue([]);
        }
        expect(wrapper).toThrow();
    });

    it("[validate] shall throw an Error when bad input type is provided", function() {
        var field = _createField(null);
        function wrapper() {
            field.$value = [];
            field.validate();
        }
        expect(wrapper).toThrow();
    });

    it("[reset] Component should be reset to its original value", function() {
        var memo = new Date(), value = new Date(2011, 10, 15, 10, 58, 55, 48);
        var field = _createField(memo);
        field.$value = value;
        expect(field.$value.toUTCString()).toEqual(value.toUTCString());
        field.reset();
        expect(field.$value.toUTCString()).toEqual(memo.toUTCString());
    });
});