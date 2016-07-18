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
 *  Base Field UTs
 *
 *  """
 */

describe("Component.Field.Field unit tests", function() {

    var _createField = function (type, value) {
        return new window['Apy' + type.capitalize() + 'Field'](
            {$log: console},
            type + ".test",
            {type: type},
            value);
    };

    it("[validate][valid type value] nominal case (String, Boolean, Number fields)", function() {
        var fields = [['string', ""], ['boolean', true], ['number', 0.0], ['datetime', new Date()]];
        fields.forEach(function (fieldInfo) {
            var type = fieldInfo[0], value = fieldInfo[1];
            var field = _createField(type, value);
            expect(field.validate()).toBeUndefined();
        });
    });

    it("[validate][Null type value] shall validate (String, Boolean, Number fields)", function() {
        var fields = [['string', null], ['boolean', null], ['number', null], ['datetime', null]];
        fields.forEach(function (fieldInfo) {
            var type = fieldInfo[0], value = fieldInfo[1];
            var field = _createField(type, value);
            expect(field.validate()).toBeUndefined();
        });
    });

    it("[validate][Undefined type value] shall validate (String, Boolean, Number fields)", function() {
        var fields = [['string', undefined], ['boolean', undefined], ['number', undefined], ['datetime', undefined]];
        fields.forEach(function (fieldInfo) {
            var type = fieldInfo[0], value = fieldInfo[1];
            var field = _createField(type, value);
            expect(field.validate()).toBeUndefined();
        });
    });

    it("[reset] Component should be reset to its original value", function() {
        var fields = [
            ['string', "", "test"],
            ['boolean', false, true],
            ['list', [], [_createField('poly', new Date())]],
            ['list', [_createField('poly', 0.0)], [_createField('poly', new Date())]],
            ['number', 1, 2]
        ];
        fields.forEach(function (fieldInfo) {
            var type = fieldInfo[0], memo = fieldInfo[1], value = fieldInfo[2];
            var field = _createField(type, memo);
            field.$value = value;
            field.reset();
            expect(field.$value).toEqual(memo);
        });
    });

    it("[hasUpdated] Component should be updated", function() {
        var fields = [
            ['string', "", "test"],
            ['boolean', false, true],
            ['datetime', new Date(), new Date(2011, 10, 15, 10, 58, 55, 48)],
            ['number', 1, 2]
        ];
        fields.forEach(function (fieldInfo) {
            var type = fieldInfo[0], memo = fieldInfo[1], value = fieldInfo[2];
            var field = _createField(type, memo);
            field.$value = value;
            expect(field.hasUpdated()).toBe(true);
        });
    });

    it("[setValue] Null value", function() {
        var fields = [
            'string',
            'boolean',
            'datetime',
            'point',
            'number'
        ];
        fields.forEach(function (type) {
            var field = _createField(type, null);
            expect(field.$memo).toBeDefined();
            expect(field.$value).toBeDefined();
            expect(field.$value).toEqual(field.$memo);
        });
    });

    it("[setValue] Undefined value", function() {
        var fields = [
            'string',
            'boolean',
            'datetime',
            'point',
            'number'
        ];
        fields.forEach(function (type) {
            var field = _createField(type, undefined);
            expect(field.$memo).toBeDefined();
            expect(field.$value).toBeDefined();
            expect(field.$value).toEqual(field.$memo);
        });
    });

    it("[setValue] Valid value", function() {
        var fields = [
            ['string', ""],
            ['boolean', true],
            ['number', 0.0]
        ];
        fields.forEach(function (fieldInfo) {
            var type = fieldInfo[0], value = fieldInfo[1];
            var field = _createField(type, value);
            expect(field.$value).toBeDefined();
            expect(field.$memo).toBeDefined();
            expect(field.$value).toEqual(value);
            expect(field.$value).toEqual(field.$memo);
        });
    });


    it("[setOptions] Null value", function() {
        var fields = [
            'string',
            'boolean',
            'datetime',
            'poly',
            'point',
            'number'
        ];
        fields.forEach(function (type) {
            var field = _createField(type, null);
            expect(field.$schema).toBeDefined();
            expect(field.$allowed).toBeDefined();
            expect(field.$allowed.length).toEqual(0);
        });
    });

    it("[setOptions] Undefined value", function() {
        var fields = [
            'string',
            'boolean',
            'datetime',
            'poly',
            'point',
            'number'
        ];
        fields.forEach(function (type) {
            var field = _createField(type, undefined);
            expect(field.$schema).toBeDefined();
            expect(field.$allowed).toBeDefined();
            expect(field.$allowed.length).toEqual(0);
        });
    });
});