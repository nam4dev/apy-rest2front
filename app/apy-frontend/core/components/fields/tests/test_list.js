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
 *  List Field UTs
 *
 *  """
 */

describe("Component.Field.List unit tests", function() {

    var _createFieldByType = function (type, value, schema) {
        schema = schema || {};
        schema.type = type;
        return new window['Apy' + type.capitalize() + 'Field']({$log: console}, type + ".test", schema, value);
    };

    var _createField = function (value, schema) {
        return new _createFieldByType('list', value, schema);
    };

    it("[hasUpdated][different count] Component should be updated", function() {
        var original = [_createFieldByType('datetime', new Date())];
        var field = _createField(original);
        field.add(_createFieldByType('datetime', new Date()));
        expect(field.hasUpdated()).toBe(true);
    });

    it("[hasUpdated][child updated] Component should be updated", function() {
        var original = [new Date()];
        var field = _createField(original);
        expect(field.count()).toBe(1);
        var child  = field.getChild(0);
        child.$value = new Date(2011, 10, 15, 10, 58, 55, 48);
        expect(child.hasUpdated()).toBe(true);
        expect(field.hasUpdated()).toBe(true);
    });

    it("[setValue] Valid value", function() {
        var value = ["A test string child", "Another one :)"];
        var field = _createField(value, {type: "string"});
        expect(field.$value).toBeDefined();
        expect(field.$memo).toBeDefined();
        expect(field.$memoValue).toBeDefined();
        expect(field.$value).toEqual(value);
        expect(field.$memoValue).toEqual(value);
        expect(field.$memo).toEqual(2);
    });

    it("[cloneValue] Shall wrap into an Array when no Array provided", function() {
        var value = ["One"];
        var field = _createField(value, {type: "string"});
        var cloned = field.cloneValue(value[0]);
        expect(cloned).toEqual(value);
    });

    it("[cleanedData] Validation shall be called", function() {
        var validateCalled = false;
        var value = ["A test string child", "Another one :)"];
        var field = _createField(value, {type: "string"});
        field.validate = function () {
            validateCalled = true;
        };
        var cleaned = field.cleanedData();
        expect(validateCalled).toBe(true);
        expect(cleaned).toEqual(value);
    });

    it("[cleanedData] Cleaned value shall be valid", function() {
        var value = ["A test string child", "Another one :)"];
        var field = _createField(value, {type: "string"});
        var cleaned = field.cleanedData();
        expect(cleaned).toEqual(value);
    });

    it("[cleanedData] Cleaned value shall be valid when $allowed are specified", function() {
        var value = ["One", "Three"];
        var field = _createField(value, {type: "string", allowed: ["One", "Two", "Three"]});
        var cleaned = field.cleanedData();
        expect(cleaned).toEqual(value);
        expect(field.$value).toEqual(value);
    });
});