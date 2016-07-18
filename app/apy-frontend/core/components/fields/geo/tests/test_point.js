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
 *  Geo Point Field UTs
 *
 *  """
 */

describe("Component.Field.Point unit tests", function() {

    var _createFieldByType = function (type, value, schema) {
        schema = schema || {};
        schema.type = type;
        return new window['Apy' + type.capitalize() + 'Field']({$log: console}, type + ".test", schema, value);
    };

    var _createField = function (value, schema) {
        return new _createFieldByType('point', value, schema);
    };

    it("[setValue] Valid value", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        expect(field.$value).toBeDefined();
        expect(field.$value.x).toEqual(value.coordinates[0]);
        expect(field.$value.y).toEqual(value.coordinates[1]);
        expect(field.$memo).toBeDefined();
    });

    it("[hasUpdated] Shall be true", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        expect(field.hasUpdated()).toBe(false);
    });

    it("[hasUpdated.x.updated] Shall be true", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        field.$value.x = 1.0;
        expect(field.hasUpdated()).toBe(true);
    });

    it("[hasUpdated.y.updated] Shall be true", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        field.$value.y = 0.0;
        expect(field.hasUpdated()).toBe(true);
    });

    it("[hasUpdated.both.updated] Shall be true", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        field.$value.x = 1.0;
        field.$value.y = 0.0;
        expect(field.hasUpdated()).toBe(true);
    });

    it("[cleanedData.updated] Shall return proper value", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        field.$value.x = 1.0;
        field.$value.y = 0.0;
        expect(field.cleanedData()).toEqual({type: 'Point', coordinates: [1.0, 0.0]});
    });

    it("[cleanedData.not.updated] Shall return proper value", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        expect(field.cleanedData()).toEqual({type: 'Point', coordinates: [0.0, 1.0]});
    });

    it("[cloneValue.ApyPoint] Shall return a valid instance of ApyPoint", function() {
        var value = new ApyPoint({coordinates: [0.0, 1.0]});
        var field = _createField(value);
        expect(field.cloneValue(value) instanceof ApyPoint).toBe(true);
    });

    it("[cloneValue.not.ApyPoint] Shall return a valid instance of ApyPoint", function() {
        var value = {coordinates: [0.0, 1.0]};
        var field = _createField(value);
        expect(field.cloneValue(value) instanceof ApyPoint).toBe(true);
    });
});


