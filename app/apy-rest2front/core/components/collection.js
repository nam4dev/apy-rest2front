/**
 *  @license
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
 */
(function($apy) {
    /**
     * A Collection of Resource(s)
     *
     * @class apy.components.Collection
     *
     * @augments apy.components.ComponentMixin
     * @augments apy.components.RequestMixin
     *
     * @example
     * var service = new apy.CompositeService(...);
     * var collection = new apy.components.Collection('myResourceName', service, 'myEndpoint');
     * function error(e) {
     *     console.log('Error', e);
     * }
     * function success() {
     *     console.log('Fetched Data', arguments);
     * }
     * function progress() {
     *     console.log('Progress', arguments);
     * }
     * collection.fetch(progress)
     *           .then(success)
     *           .catch(error);
     *
     * @param {string} name Resource endpoint name
     * @param {apy.CompositeService} service Service instance
     * @param {string} endpoint REST API endpoint base
     * @param {Array} components (optional) initial components
     */
    $apy.components.Collection = (function Collection() {
        /**
         * Allow to group/chain Deferred/Promises altogether.
         *
         * @memberOf apy.components.Collection
         *
         * @param {Array} promises A list of Promise instances
         *
         * @return {Promise} A single Promise chaining given ones
         */
        function deferredAll(promises) {
            return Promise.all(promises.map(function(promise) {
                return promise.reflect();
            }));
        }

        /**
         * Define how Collection is represented.
         * A Collection joins all its inner components calling their
         * `toString()` method.
         *
         * @override
         * @memberOf apy.components.Collection
         *
         * @return {string} The Collection representation as a String
         *
         */
        function toString() {
            return '[' + this.$components.join(', ') + ']';
        }

        /**
         * Create an `apy.components.Resource` instance.
         * Either based on given payload or an empty one.
         *
         * @memberOf apy.components.Collection
         *
         * @param {Object} payload optional Object representing the Resource
         *
         * @return {apy.components.Resource} The Created Resource instance
         */
        function createResource(payload) {
            var component = this.$service.$instance.createResource(this.$name, payload);
            component.setParent(this);
            this.prepend(component);
            return component;
        }

        /**
         * Remove a given Resource from the Collection
         *
         * @override
         * @memberOf apy.components.Collection
         *
         * @param {apy.components.Resource} resource The Resource instance to remove
         *
         * @return {Array.<T>}
         */
        function remove(resource) {
            return this.$components.splice(this.$components.indexOf(resource), 1);
        }

        /**
         * Reset all inner Collection's components
         *
         * @override
         * @memberOf apy.components.Collection
         */
        function reset() {
            this.$components.forEach(function(comp) {
                comp.reset();
            });
        }

        /**
         * Return `unsaved` Resource(s) count
         *
         * @override
         * @memberOf apy.components.Collection
         *
         * @return {boolean} Has the Collection `unsaved` Resource(s) ?
         */
        function hasCreated() {
            return this.unsavedComponents().length > 0;
        }

        /**
         * Return true if at least one inner Resource is updated
         *
         * @override
         * @memberOf apy.components.Collection
         *
         * @return {boolean} Is the Collection updated ?
         */
        function hasUpdated() {
            var updated = false;
            this.$components.forEach(function(comp) {
                if (comp.hasUpdated()) {
                    updated = true;
                }
            });
            return updated;
        }

        /**
         * Set given state to all `saved` Resource(s)
         *
         * @override
         * @memberOf apy.components.Collection
         *
         * @param {string} state State amongst {CREATE, READ, UPDATE, DELETE}
         *
         * @return {apy.components.Collection}
         */
        function setState(state) {
            this.savedComponents().forEach(function(comp) {
                comp.setState(state);
            });
            return this;
        }

        /**
         * Factorize logic
         * Return whether or not at least one Collection's component's
         * current state is in the given state
         *
         * @override
         * @memberOf apy.components.Collection
         *
         * @return {boolean} Has Collection some of this state ?
         */
        function isState(state) {
            return this.$components.some(function(comp) {
                return comp.isState(state);
            });
        }

        /**
         * Load given Resource Objects into the Collection (recursively)
         *
         * @memberOf apy.components.Collection
         *
         * @param {Array} items A list of Resource Objects
         */
        function load(items) {
            for (var i = 0; i < items.length; i++) {
                var resource = items[i];
                this.createResource(resource);
            }
            return this;
        }

        /**
         * Shortcut to create & save all components (according to their state)
         *
         * @memberOf apy.components.Collection
         *
         * @return {Promise} A single Promise
         */
        function save() {
            return deferredAll([this.create(), this.update()]);
        }

        /**
         * Fetch all Resource Objects based on config parameters
         *
         * @memberOf apy.components.Collection
         *
         * @param {function} progressHandler A progress handler
         *
         * @return {Promise} Asynchronous call
         */
        function fetch(progressHandler) {
            var self = this;
            var progress = progressHandler || function(counter) {
                    console.log('Progress handler', counter);
                };
            progress(25);
            return new Promise(function(resolve, reject) {
                self.clear();
                progress(50);
                function on_success(response) {
                    progress(75);
                    self.load(response._items);
                    progress(100);
                    return resolve(response);
                }

                function on_failure(error) {
                    console.error('[ApyFrontendError] => ', error);
                    progress(100);
                    return reject(new $apy.errors.EveHTTPError(error));
                }

                function on_progress(evt) {
                    var fileName;
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    try {
                        fileName = evt.config.data.file.name;
                    }
                    catch (e) { fileName = null; }
                    console.log('progress: ' + progressPercentage + '% ' + fileName, evt);
                    progress(progressPercentage);
                }

                return self.request({
                    url: self.$endpoint,
                    method: 'GET'
                }).then(on_success, on_failure, on_progress);
            });
        }

        /**
         * Create all `unsaved` Resource(s)
         *
         * @memberOf apy.components.Collection
         *
         * @return {Promise} A single Promise chaining all created Resource(s)
         */
        function create() {
            // FIXME: Shall be optimized if `bulk_enabled` is true, making a single request to backend
            var promises = [];
            this.unsavedComponents().forEach(function(comp) {
                var defer = comp.create();
                if (defer) {
                    promises.push(defer);
                }
            });
            return deferredAll(promises);
        }

        /**
         * Update all `saved` Resource(s)
         *
         * @memberOf apy.components.Collection
         *
         * @return {Promise} A single Promise chaining all updated Resource(s)
         */
        function update() {
            // FIXME: Shall be optimized if `bulk_enabled` is true, making a single request to backend
            var promises = [];
            var selection = this.selectedOrSaved();

            selection.forEach(function(comp) {
                var defer = comp.update();
                if (defer) {
                    promises.push(defer);
                }
            });
            return deferredAll(promises);
        }

        /**
         * Delete all `saved` Resource(s)
         *
         * @alias delete
         * @memberOf apy.components.Collection
         *
         * @return {Promise} A single Promise chaining all deleted Resource(s)
         */
        function del() {
            // FIXME: Shall be optimized using DELETE on root (/) endpoint without ID
            var promises = [];
            var selection = this.selectedOrSaved();

            selection.forEach(function(comp) {
                var defer = comp.delete();
                if (defer) {
                    promises.push(defer);
                }
            });
            this.clear();
            return deferredAll(promises);
        }

        /**
         * Clear all Collection's components (Resources)
         *
         * @memberOf apy.components.Collection
         *
         * @return {apy.components.Collection}
         */
        function clear() {
            var selection = this.selectedComponents();
            if(selection.length) {
                var self = this;
                selection.forEach(function (res) {
                    self.removeResource(res)
                });
            }
            else {
                this.$components = [];
            }
            return this;
        }

        /**
         * Select all components (set the `selected` attribute)
         *
         * @memberOf apy.components.Collection
         */
        function selectAll() {
            this.savedComponents().forEach(function (comp) {
                comp.selected = true;
            });
        }

        /**
         * Unselect all components (set the `selected` attribute)
         *
         * @memberOf apy.components.Collection
         */
        function unselectAll() {
            this.savedComponents().forEach(function (comp) {
                comp.selected = false;
            });
        }

        /**
         * toggle-select all components (set the `selected` attribute)
         *
         * @memberOf apy.components.Collection
         */
        function toggleSelect() {
            var selected = this.selectedComponents();
            if(!selected.length) {
                this.selectAll();
            }
            else {
                this.unselectAll();
            }
        }

        /**
         * Return the selected components if any or saved Resource(s)
         *
         * @memberOf apy.components.Collection
         *
         * @return {Array} `selected` or `saved` Resource(s)
         */
        function selectedOrSaved() {
            var selected = this.selectedComponents();
            return selected.length ? selected: this.savedComponents()

        }

        /**
         * Represents the count of `saved` Resource(s)
         *
         * @memberOf apy.components.Collection
         *
         * @return {Integer} `saved` Resource(s) count
         */
        function savedCount() {
            return this.savedComponents().length;
        }

        /**
         * Filter `saved` components from `unsaved` ones
         *
         * @memberOf apy.components.Collection
         *
         * @return {Array} filtered Components
         */
        function savedComponents() {
            return this.$components.filter(function(comp) {
                return !comp.hasCreated();
            });
        }

        /**
         * Filter `unsaved` components from `saved` ones
         *
         * @memberOf apy.components.Collection
         *
         * @return {Array} filtered Components
         */
        function unsavedComponents() {
            return this.$components.filter(function(comp) {
                return comp.hasCreated() && comp.hasUpdated();
            });
        }

        /**
         * Filter `selected` components (resources)
         *
         * @memberOf apy.components.Collection
         *
         * @return {Array} selected Components
         */
        function selectedComponents() {
            return this.$components.filter(function(comp) {
                return comp.selected;
            });
        }

        /**
         * Collection Constructor
         *
         * @param name
         * @param service
         * @param endpoint
         * @param components
         *
         * @constructor
         */
        return function(service, name, endpoint, components) {
            this.initialize(service, name, service.$instance.get(name), null, null, endpoint + name, $apy.helpers.$TYPES.COLLECTION, null, components);
            this.$endpointBase = endpoint;
            this.$Class = $apy.components.Collection;
            if (this.$schema.$embeddedURI)
                this.$endpoint += '?' + this.$schema.$embeddedURI;

            this.load = load;
            this.save = save;
            this.delete = del;
            this.clear = clear;
            this.reset = reset;
            this.fetch = fetch;
            this.create = create;
            this.update = update;
            this.isState = isState;
            this.setState = setState;
            this.toString = toString;
            this.selectAll = selectAll;
            this.savedCount = savedCount;
            this.removeResource = remove;
            this.hasCreated = hasCreated;
            this.hasUpdated = hasUpdated;
            this.unselectAll = unselectAll;
            this.toggleSelect = toggleSelect;
            this.createResource = createResource;
            this.selectedOrSaved = selectedOrSaved;
            this.savedComponents = savedComponents;
            this.unsavedComponents = unsavedComponents;
            this.selectedComponents = selectedComponents;

            return this;
        };
    })();

    // Inject Mixin
    $apy.components.ComponentMixin.call(
        $apy.components.Collection.prototype
    );
    $apy.components.RequestMixin.call(
        $apy.components.Collection.prototype
    );
})(apy);
