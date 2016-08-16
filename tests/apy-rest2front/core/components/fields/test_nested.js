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
 *  Hashmap Field UTs
 *
 *  """
 */

describe("Component.Field.Nested unit tests", function() {

    var _createField = function (value, schema) {
        return apy.tests.createFieldByType('nested', value, schema);
    };

    it("[cleanedData] shall return an Object-like instance based on its Component(s) type & state (updated)", function() {
        var value = {
            test: "A string value",
            date: new Date(),
            items: [
                "One",
                "Two"
            ]
        };
        var upDate = new Date();
        var upString = "An updated string value";
        var schema = {
            test: {type: "string"},
            date: {type: "datetime"},
            items: {type: "list", schema: {type: "string"}}
        };
        var field = _createField(value, schema);
        field.$components.forEach(function (comp) {
            switch (comp.$type) {
                case apy.helpers.$TYPES.STRING:
                    comp.$value = upString;
                    break;
                case apy.helpers.$TYPES.DATETIME:
                    comp.$value = upDate;
                    break;
                default:
                    break;
            }
        });

        var cleaned = field.cleanedData();
        expect(cleaned).toEqual({
            test: upString,
            date: upDate.toUTCString(),
            items: value.items
        });
    });
});
