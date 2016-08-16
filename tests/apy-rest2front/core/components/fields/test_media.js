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
 *  Media Field UTs
 *
 *  """
 */

describe("Component.Field.Media unit tests", function() {

    var _createField = function (value, schema) {
        return apy.tests.createFieldByType('media', apy.tests.factory.createMediaFile(value), schema);
    };

    // FIXME: seems not to be executed until Promise process (async)
    //var readFile = function (f) {
    //    return new Promise(function (resolve, reject) {
    //        var reader = new FileReader();
    //        reader.onerror = function (e) {
    //            return reject(e);
    //        };
    //        reader.onload = function(e) {
    //            return resolve(e.target.result);
    //        };
    //        reader.readAsDataURL(f);
    //    });
    //};

    it("[cloneValue.String.input] shall return an apy.helpers.MediaFile instance", function() {
        var info = '/media/575bede345feda1fd4515556';
        var field = _createField(info);
        expect(field.cloneValue(info) instanceof apy.tests.$types.MediaFile).toBe(true);
    });

    it("[cloneValue.FileInfo.input] shall return an apy.helpers.MediaFile instance", function() {
        var info = {
            file: '/media/575bede345feda1fd4515556',
            content_type: 'image/png',
            name: "avatar.png"
        };
        var field = _createField(info);
        expect(field.cloneValue(info) instanceof apy.tests.$types.MediaFile).toBe(true);
    });

    it("[cloneValue:apy.helpers.MediaFile:input] shall return an apy.helpers.MediaFile instance", function() {
        var info = {
            file: '/media/575bede345feda1fd4515556',
            content_type: 'image/png',
            name: "avatar.png"
        };
        var field = _createField(null);
        expect(field.cloneValue(apy.tests.factory.createMediaFile(info)) instanceof apy.tests.$types.MediaFile).toBe(true);
    });

    it("[cleanedData.String.input] Shall return NULL ($value.$file property)", function() {
        var info = '/media/575bede345feda1fd4515556';
        var field = _createField(info);
        expect(field.cleanedData()).toEqual(null);
    });

    it("[cleanedData.FileInfo.input] Shall return NULL ($value.$file property)", function() {
        var info = {
            file: '/media/575bede345feda1fd4515556',
            content_type: 'image/png',
            name: "avatar.png"
        };
        var field = _createField(info);
        expect(field.cleanedData()).toEqual(null);
    });

    // FIXME: seems not to be executed until Promise process (async)
    //it("[cleanedData.File.input] Shall return $value.$file property (not NULL)", function() {
    //    readFile('http://jsfiddle.net/img/logo.png').then(function (file) {
    //        console.error(file);
    //        var field = _createField(file);
    //        expect(field.cleanedData()).toEqual(file.file);
    //    }).catch(function (error) {
    //        console.error(error);
    //        expect(true).toBe(false);
    //    });
    //});

    it("[constructor.FileInfo.input] File Instance ($value) properties shall be properly set", function() {
        var info = {
            file: '/media/575bede345feda1fd4515556',
            content_type: 'image/png',
            name: "avatar.png"
        };
        var field = _createField(info);
        var fieldFile = field.$value;
        expect(fieldFile instanceof apy.tests.$types.MediaFile).toBe(true);
        expect(fieldFile.$file).toEqual(info.file);
        expect(fieldFile.$type).toEqual(info.content_type);
        expect(fieldFile.$name).toEqual(info.name);
        expect(fieldFile.$isImage).toBe(true);
        expect(fieldFile.$lastModified).toEqual(info.lastModified);
        expect(fieldFile.$lastModifiedDate).toEqual(info.lastModifiedDate);
    });

    it("[constructor.String.input] File Instance ($value) properties shall be properly set", function() {
        var info = '/media/575bede345feda1fd4515556';
        var field = _createField(info);
        var fieldFile = field.$value;
        expect(fieldFile instanceof apy.tests.$types.MediaFile).toBe(true);
        expect(fieldFile.$file).toEqual(info);
        expect(fieldFile.$type).toBeUndefined();
        expect(fieldFile.$name).toBeUndefined();
        expect(fieldFile.$isImage).toBe(false);
        expect(fieldFile.$lastModified).toBeUndefined();
        expect(fieldFile.$lastModifiedDate).toBeUndefined();
    });
});