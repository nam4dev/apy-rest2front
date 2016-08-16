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
 *  Collection Component UTs
 *
 *  """
 */

describe("Component.Collection unit tests", function() {
    function _createCollection (service, name, endpoint, components) {
        return new apy.tests.$types.components.Collection(service || apy.tests.createService(), name,
            endpoint || apy.tests.DEFAULT_ENDPOINT, components);
    }

    it("[createResource] A Resource instance shall be append to the Collection", function() {
        var col = _createCollection(undefined, 'tests');
        col.createResource();
        expect(col.count()).toEqual(1);
        expect(col.getChild(0) instanceof apy.tests.$types.components.Resource).toBe(true);
    });

    it("[removeResource] Given Resource shall be spliced from the collection", function() {
        var col = _createCollection(undefined, 'tests');
        var resource = col.createResource();
        expect(col.count()).toEqual(1);
        expect(col.getChild(0) instanceof apy.tests.$types.components.Resource).toBe(true);
        col.removeResource(resource);
        expect(col.count()).toEqual(0);
    });

    it("[setCreateState] CREATE State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('CREATE');
        };
        col.setCreateState();
    });

    it("[setReadState] READ State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('READ');
        };
        col.setReadState();
    });

    it("[setUpdateState] UPDATE State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('UPDATE');
        };
        col.setUpdateState();
    });

    it("[setDeleteState] DELETE State shall be passed", function() {
        var col = _createCollection(undefined, 'tests');
        col.setState = function (state) {
            expect(state).toEqual('DELETE');
        };
        col.setDeleteState();
    });

    it("[reset] Shall call inner $components reset method", function() {
        var collection = _createCollection(undefined, 'tests');
        var callCount = 0;
        var child1 = {
            reset: function () {
                callCount++;
            }
        };
        var child2 = {
            reset: function () {
                callCount++;
            }
        };
        var child3 = {
            reset: function () {
                callCount++;
            }
        };
        var children = [child1, child2, child3];
        children.forEach(function (child) {
            collection.add(child);
        });
        expect(collection.count()).toEqual(children.length);
        collection.reset();
        expect(callCount).toEqual(children.length);
    });

    it("[load] Shall load data into Collection components", function() {
        var resources = [
            {test: []},
            {test: [1, 2]},
            {test: ["One", "Two"]}
        ];
        var col = _createCollection(undefined, 'tests');
        col.load(resources);
        expect(col.count()).toEqual(resources.length);
    });

    it("[clear] Shall clear Collection components", function() {
        var resourceCount = 5;
        var col = _createCollection(undefined, 'tests');
        for(var i=0; i<resourceCount; i++) {
            col.createResource();
        }
        expect(col.count()).toEqual(resourceCount);
        col.clear();
        expect(col.count()).toEqual(0);
    });

    it("[save] Shall call create & update", function() {
        var createCall = false;
        var updateCall = false;
        var col = _createCollection(undefined, 'tests');
        col.create = function () {
            createCall = true;
            return {
                reflect: function () {

                }
            };
        };
        col.update = function () {
            updateCall = true;
            return {
                reflect: function () {

                }
            };
        };
        col.save();
        expect(createCall).toBe(true);
        expect(updateCall).toBe(true);
    });

    it("[create] Create method of all inner components shall be called", function() {
        var callCount = 0;
        var hcCallCount = 0;
        var col = _createCollection(undefined, 'tests');
        var children = [
            {
                hasCreated: function () {
                    hcCallCount++;
                    return true;
                },
                hasUpdated: function () {
                    return true;
                },
                create: function () {
                    callCount++;
                }
            },
            {
                hasCreated: function () {
                    hcCallCount++;
                    return true;
                },
                hasUpdated: function () {
                    return true;
                },
                create: function () {
                    callCount++;
                }
            },
            {
                hasCreated: function () {
                    hcCallCount++;
                    return true;
                },
                hasUpdated: function () {
                    return true;
                },
                create: function () {
                    callCount++;
                }
            }
        ];
        children.forEach(function (child) {
            col.add(child);
        });
        expect(col.count()).toEqual(children.length);
        col.create();
        expect(callCount).toEqual(children.length);
        expect(hcCallCount).toEqual(children.length);
    });

    it("[update] Update method of all inner components shall be called", function() {
        var callCount = 0;
        var hcCallCount = 0;
        var col = _createCollection(undefined, 'tests');
        var children = [
            {
                hasCreated: function () {
                    hcCallCount++;
                    return false;
                },
                hasUpdated: function () {
                    return false;
                },
                update: function () {
                    callCount++;
                }
            },
            {
                hasCreated: function () {
                    hcCallCount++;
                    return false;
                },
                hasUpdated: function () {
                    return false;
                },
                update: function () {
                    callCount++;
                }
            },
            {
                hasCreated: function () {
                    hcCallCount++;
                    return false;
                },
                hasUpdated: function () {
                    return false;
                },
                update: function () {
                    callCount++;
                }
            }
        ];
        children.forEach(function (child) {
            col.add(child);
        });
        expect(col.count()).toEqual(children.length);
        col.update();
        expect(callCount).toEqual(children.length);
        expect(hcCallCount).toEqual(children.length);
    });

    it("[delete] Delete method of all inner components shall be called", function() {
        var callCount = 0;
        var hcCallCount = 0;
        var col = _createCollection(undefined, 'tests');
        var children = [
            {
                hasCreated: function () {
                    hcCallCount++;
                    return false;
                },
                hasUpdated: function () {
                    return false;
                },
                delete: function () {
                    callCount++;
                }
            },
            {
                hasCreated: function () {
                    hcCallCount++;
                    return false;
                },
                hasUpdated: function () {
                    return false;
                },
                delete: function () {
                    callCount++;
                }
            },
            {
                hasCreated: function () {
                    hcCallCount++;
                    return false;
                },
                hasUpdated: function () {
                    return false;
                },
                delete: function () {
                    callCount++;
                }
            }
        ];
        children.forEach(function (child) {
            col.add(child);
        });
        expect(col.count()).toEqual(children.length);
        col.delete();
        expect(callCount).toEqual(children.length);
        expect(col.count()).toEqual(0);
        expect(hcCallCount).toEqual(children.length);
    });

    it("[hasCreated] Shall return true (some components are true)", function() {
        var callCount = 0;
        var col = _createCollection(undefined, 'tests');
        col.add({
            hasCreated: function () {
                callCount++;
                return false;
            },
            hasUpdated: function () {
                return false;
            }
        });
        col.add({
            hasCreated: function () {
                callCount++;
                return false;
            },
            hasUpdated: function () {
                return false;
            }
        });
        col.add({
            hasCreated: function () {
                callCount++;
                return true;
            },
            hasUpdated: function () {
                return true;
            }
        });
        expect(col.hasCreated()).toBe(true);
        expect(callCount).toEqual(3);
    });

    it("[hasCreated] Shall return false (none of components are true)", function() {
        var callCount = 0;
        var col = _createCollection(undefined, 'tests');
        col.add({
            hasCreated: function () {
                callCount++;
                return false;
            }
        });
        col.add({
            hasCreated: function () {
                callCount++;
                return false;
            }
        });
        col.add({
            hasCreated: function () {
                callCount++;
                return false;
            }
        });
        expect(col.hasCreated()).toBe(false);
        expect(callCount).toEqual(3);
    });

    it("[hasUpdated] Shall return true (some components are true)", function() {
        var callCount = 0;
        var col = _createCollection(undefined, 'tests');
        col.add({
            hasUpdated: function () {
                callCount++;
                return false;
            }
        });
        col.add({
            hasUpdated: function () {
                callCount++;
                return true;
            }
        });
        col.add({
            hasUpdated: function () {
                callCount++;
                return false;
            }
        });
        expect(col.hasUpdated()).toBe(true);
        expect(callCount).toEqual(3);
    });

    it("[hasUpdated] Shall return false (none of components are true)", function() {
        var callCount = 0;
        var col = _createCollection(undefined, 'tests');
        col.add({
            hasUpdated: function () {
                callCount++;
                return false;
            }
        });
        col.add({
            hasUpdated: function () {
                callCount++;
                return false;
            }
        });
        col.add({
            hasUpdated: function () {
                callCount++;
                return false;
            }
        });
        expect(col.hasUpdated()).toBe(false);
        expect(callCount).toEqual(3);
    });

    it("[savedCount] Shall return the amount of Saved resource (_id != empty)", function() {
        var col = _createCollection(undefined, 'tests');
        col.add({
            hasCreated: function () {
                return !this._id;
            },
            hasUpdated: function () {
                return false;
            },
            _id: "0123456789"
        });
        col.add({
            hasCreated: function () {
                return !this._id;
            },
            hasUpdated: function () {
                return false;
            },
            _id: undefined
        });
        col.add({
            hasCreated: function () {
                return !this._id;
            },
            hasUpdated: function () {
                return false;
            },
            _id: undefined
        });
        expect(col.savedCount()).toEqual(1);
    });
});
