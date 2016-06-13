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
 *  Poly Morph Field UTs
 *
 *  """
 */

describe("Component.Field.Poly unit tests", function() {

    var _createFieldByType = function (type, value) {
        return new window['Apy' + type.capitalize() + 'Field']({$log: console}, type + ".test", {type: type}, value);
    };

    var _createField = function (value) {
        return new _createFieldByType('poly', value);
    };

    var _morphsTo = function (type, value, expectedValue) {
        var field = _createField(value);
        field.setParent(_createField('[PARENT] ' + value));
        expect(field.$value).toEqual(value);
        expect(field.$type).toEqual('poly');
        expect(field.$contentUrl).toEqual('field-poly.html');
        field.setType(type);
        expect(field.$type).toEqual(type);
        switch (type) {
            case 'list':
                expect(field.count()).toEqual(value.length);
                break;
            case 'datetime':
                expect(isDate(field.$value)).toBe(true);
                break;
            default :
                expect(field.$value).toEqual(expectedValue);
                break;
        }
        if(apy.common.FIELD_TYPES_MAP.hasOwnProperty(type)) {
            type = apy.common.FIELD_TYPES_MAP[type];
        }
        expect(field.$contentUrl).toEqual('field-' + type + '.html');
    };

    it("[setType] shall morphs from Poly to Boolean type", function() {
        var expectedValue = false;
        var value = "A poly field for test";
        _morphsTo('boolean', value, expectedValue);
    });

    it("[setType] shall morphs from Poly to Datetime type", function() {
        var value = new Date();
        _morphsTo('datetime', value);
    });

    it("[setType] shall morphs from Poly to Hashmap type", function() {
        var value = {test: "A test"};
        // FIXME: Resource & Hashmap seems messed up
        // FIXME: Grouping all into hashmap or Resource shall be thought about
        //_morphsTo('hashmap', value, null);
    });

    it("[setType] shall morphs from Poly to List type", function() {
        var value = ['One', 'Two', 'Three'];
        _morphsTo('list', value, null);
    });

    it("[setType] shall morphs from Poly to Media type", function() {
        var value = {file: "/image/test.jpg", content_type: "image/jpeg", name: "imageTest"};
        // FIXME: Promise seems to be a problem to karma
        // FIXME: Need to groom about that (async & karma)
        //_morphsTo('media', value);
    });

    it("[setType] shall morphs from Poly to Number type", function() {
        var value = 1.0;
        _morphsTo('number', value, value);
    });

    it("[setType] shall morphs from Poly to ObjectID (Embedded) type", function() {
        var value = "575efd2a45feda5202c60e61";
        // FIXME: Not implemented behavior
        //_morphsTo('objectid', value);
    });

    it("[setType] shall morphs from Poly to String", function() {
        var value = "A test string value";
        _morphsTo('string', value, value);
    });
});