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

    var parent = {};

    // Mocking Child
    var Child = function (name) {
        this.$value = name + ": A child";
        this.$components = [];
        this.hasUpdated = function () {
            return true;
        };
        this.cleanedData = function () {
            return this.$value;
        }
    };

    // Mocking Service
    var Service = function () {
        this.$log = console;
    };

    var _createBaseComponent = function (type, value, components) {
        var component = new ApyComponentMixin();
        //service, name, schema, value, $states, $endpoint, type, relationName, components
        component.initialize(new Service(), "Component.Base.test", {}, value, null, null, type, null, components);
        component.setParent(parent);
        return component;
    };

    it("[log] Shall log message using Service logger instance", function () {
        var message = "A string";
        var component = _createBaseComponent();
        component.$service = {
            $log: function () {
                expect(arguments[0]).toEqual(message)
            }
        };
        component.$log(message);
    });

    it("[add] Inner $components Array shall contains the child", function () {
        var child = "A string";
        var component = _createBaseComponent();
        component.add(child);
        expect(component.$components.length).toEqual(1);
        expect(component.$components[0]).toEqual(child);
    });

    it("[prepend] Inner $components Array shall contains the child at index 0", function () {
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

    it("[hasChildren] Shall return false", function () {
        var component = _createBaseComponent();
        expect(component.count()).toEqual(0);
        expect(component.hasChildren()).toBe(false);
    });

    it("[hasChildren] Shall return true", function () {
        var component = _createBaseComponent();
        component.add("A child");
        expect(component.count()).toEqual(1);
        expect(component.hasChildren()).toBe(true);
    });

    it("[cleanedData] Shall return an empty list", function () {
        var component = _createBaseComponent();
        expect(component.cleanedData()).toEqual([]);
    });

    it("[cleanedData] Shall return a list of child", function () {
        var childCount = 5;
        var expectedValue = [];
        var component = _createBaseComponent();
        for (var i=0; i<childCount; i++) {
            var child = new Child(i);
            component.add(child);
            expectedValue.push(child.cleanedData());
        }
        expect(component.count()).toEqual(childCount);
        expect(component.cleanedData()).toEqual(expectedValue);
    });

    it("[initialize] Shall set correct properties according to parameters", function () {
        var value = [];
        var type = "base";
        var component = _createBaseComponent(type);
        expect(component.$name).toBeDefined();
        expect(component.$type).toBeDefined();
        expect(component.$type).toEqual(type);
        expect(component.$types).toBeDefined();
        expect(component.$typesMap).toBeDefined();
        expect(component.$typesMap.object).toBeDefined();
        expect(component.$typesMap.number).toBeDefined();
        expect(component.$typesMap.string).toBeDefined();
        expect(component.$service).toBeDefined();
        expect(component.$service.$log).toBeDefined();
        expect(component.$typesFactory).toBeDefined();
        expect(component.$fieldTypesMap).toBeDefined();
        expect(component.$components).toBeDefined();
        expect(component.$components).toEqual(value);
        expect(component.$typesForPoly).toBeDefined();
        expect(component.$contentUrl).toBeDefined();
        expect(component.$contentUrl).toEqual('field-' + type + '.html');
    });

    it("[loadValue] '$value' property shall not be set", function () {
        var component = _createBaseComponent();
        component.loadValue();
        expect(component.$value).toEqual('');
    });

    it("[loadValue] '$value' property shall be set with only 'required' inner component(s)", function () {
        var components = [];
        var expectedValue = '1: A child, 2: A child';
        for (var i=0; i<5; i++) {
            var child = new Child(i);
            components.push(child);
            if(2 % i === 0) {
                child.$required = true;
            }
        }
        var component = _createBaseComponent('base', null, components);
        component.loadValue();
        expect(component.$value).toEqual(expectedValue);
    });

    it("[loadValue] '$value' property shall be set with only all inner components as none are required", function () {
        var components = [];
        var expectedValue = '0: A child, 1: A child, 2: A child, 3: A child, 4: A child';
        for (var i=0; i<5; i++) {
            var child = new Child(i);
            components.push(child);
        }
        var component = _createBaseComponent('base', null, components);
        component.loadValue();
        expect(component.$value).toEqual(expectedValue);
    });

    it("[toString] '$value' property shall be set with only all inner components as none are required", function () {
        var components = [];
        var expectedValue = '0: A child, 1: A child, 2: A child, 3: A child, 4: A child';
        for (var i=0; i<5; i++) {
            var child = new Child(i);
            components.push(child);
        }
        var component = _createBaseComponent('base', null, components);
        expect(component.toString()).toEqual(expectedValue);
        expect(component + '').toEqual(expectedValue);
    });

    it("[shallContinue] Shall return true", function () {
        var component = _createBaseComponent();
        expect(component.continue("_startWithUnderscore")).toBe(true);
    });

    it("[shallContinue] Shall return true", function () {
        var component = _createBaseComponent();
        expect(component.continue("_startWithUnderscore")).toBe(true);
    });

    it("[clone.undefined.$Class] Shall return undefined", function () {
        var component = _createBaseComponent();
        component.$Class = undefined;
        expect(component.clone).toThrow();
    });

    it("[clone.defined.$Class] Shall return a clone based on $Class property", function () {
        var clone;
        var value = "a value";
        var component = _createBaseComponent('base', null);
        component.$Class = function () {

            this.$name = arguments[1];
            this.$type = arguments[6];
            this.$value = arguments[3];
            this.$schema = arguments[2];
            this.$states = arguments[4];
            this.$service = arguments[0];
            this.$endpoint = arguments[5];
            this.$relationName = arguments[7];
            this.$components = arguments[8];

            this.setParent = function (parent) {
                expect(parent).toBeDefined();
            }
        };
        clone = component.clone(null, value);
        expect(clone.$name).toEqual(component.$name);
        expect(clone.$type).toEqual(component.$type);
        expect(clone.$value).toEqual(value);
        expect(clone.$schema).toEqual(component.$schema);
        expect(clone.$states).toEqual(component.$states);
        expect(clone.$service).toEqual(component.$service);
        expect(clone.$endpoint).toEqual(component.$endpoint);
        expect(clone.$relationName).toEqual(component.$relationName);
    });

    it('[createPolyField] Shall create a new ApyPolyField instance', function () {
        var component = _createBaseComponent('base', null);
        component.createPolyField()
    });
});