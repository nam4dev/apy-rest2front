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
 *  ObjectID Field UTs
 *
 *  """
 */
describe("Component.Field.ObjectID unit tests", function() {

    var _createFieldByType = function (type, value, schema) {
        schema = schema || {};
        schema.type = type;
        return new window['Apy' + type.capitalize() + 'Field']({
            $log: console,
            $instance: {
                schema2data: function () {
                    return {}
                }
            }
        }, type + ".test", schema, value);
    };

    var _createField = function (value, schema) {
        return new _createFieldByType('embedded', value, schema);
    };

    it("[selfUpdate] Shall update instance `_id` & `$components` attributes", function() {
        var value = {
            _id: "0123456789A9876543210"
        };
        var field = _createField({});
        expect(field._id).toBeUndefined();
        field.selfUpdate(value);
        expect(field._id).toEqual(value._id);
        expect(field.$components).toEqual([]);
    });

    it("[cleanedData] Shall return instance `_id` attribute", function() {
        var value = {
            _id: "0123456789A9876543210"
        };
        var field = _createField(value);
        field.selfUpdate(value);
        var cleaned = field.cleanedData();
        expect(cleaned).toEqual(value._id);
        expect(cleaned).toEqual(field._id);
    });

});