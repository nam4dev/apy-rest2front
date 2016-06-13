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
 *  Component Base UTs
 *
 *  """
 */

describe("Component.Base unit tests", function() {

    var _createBaseComponent = function (type, value) {
        var component = new ApyComponentMixin();
        component.init({$log: console}, "Component.Base.test", value, type);
        return component;
    };

    it("[add.a.child] Inner $components Array shall contains the child", function () {
        var child = "A string";
        var component = _createBaseComponent();
        component.add(child);
        expect(component.$components.length).toEqual(1);
        expect(component.$components[0]).toEqual(child);
    });

    it("[prepend.a.child] Inner $components Array shall contains the child at index 0", function () {
        var child = "A string";
        var prependedChild = "Another string";
        var component = _createBaseComponent();
        component.add(child);
        expect(component.$components[0]).toEqual(child);
        component.prepend(prependedChild);
        expect(component.$components.length).toEqual(2);
        expect(component.$components[0]).toEqual(prependedChild);
        expect(component.$components[1]).toEqual(child);
    });

    it("[count] Shall return inner $components Array length", function () {
        var children = [1, 2, 3, 4, 5, 6, 7, 8];
        var component = _createBaseComponent();
        children.forEach(function (child) {
            component.add(child);
        });
        expect(component.count()).toEqual(children.length);
        expect(component.count()).toEqual(component.$components.length);
        expect(component.$components).toEqual(children);
    });

    it("[remove] Shall remove given child", function () {
        var children = [1, 2, 3, 4, 5, 6, 7, 8];
        var component = _createBaseComponent();
        children.forEach(function (child) {
            component.add(child);
        });
        expect(component.count()).toEqual(8);
        component.remove(children[2]); // value: 3
        expect(component.count()).toEqual(7);
        expect(component.getChild(2)).toEqual(children[3]);
    });
});