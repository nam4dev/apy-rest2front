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
 *
 *  """
 *  Apy Collection Component abstraction
 *
 *  """
 */
(function ( $apy ) {

    /**
     * Collection
     *
     * @class apy.components.Collection
     *
     * @augments ComponentMixin
     * @augments RequestMixin
     *
     * @param name
     * @param service
     * @param endpoint
     * @param components
     */
    $apy.components.Collection = (function Collection() {

        /**
         *
         * @param promises
         * @returns {Promise}
         * @memberOf apy.components.Collection
         */
        function deferredAll(promises) {
            return Promise.all(promises.map(function(promise) {
                return promise.reflect();
            }));
        }

        /**
         *
         * @override
         * @returns {string}
         * @memberOf apy.components.Collection
         */
        function toString() {
            return '[' + this.$components.join(', ') + ']';
        }

        /**
         *
         * @param resource
         * @returns {Resource}
         * @memberOf apy.components.Collection
         */
        function createResource (resource) {
            var component = this.$service.$instance.createResource(this.$name, resource);
            component.setParent(this);
            this.prepend(component);
            return component;
        }

        /**
         *
         * @param resource
         * @returns {Array.<T>}
         * @memberOf apy.components.Collection
         */
        function remove (resource) {
            return this.$components.splice(this.$components.indexOf(resource), 1);
        }

        /**
         *
         * @override
         * @memberOf apy.components.Collection
         */
        function reset () {
            this.$components.forEach(function (comp) {
                comp.reset();
            });
        }

        /**
         *
         * @override
         * @returns {boolean}
         * @memberOf apy.components.Collection
         */
        function hasCreated () {
            return this.unsavedComponents().length > 0;
        }

        /**
         *
         * @override
         * @returns {boolean}
         * @memberOf apy.components.Collection
         */
        function hasUpdated () {
            var updated = false;
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated()) {
                    updated = true;
                }
            });
            return updated;
        }

        /**
         *
         * @override
         * @param state
         * @returns {this}
         * @memberOf apy.components.Collection
         */
        function setState (state) {
            this.savedComponents().forEach(function (comp) {
                comp.setState(state);
            });
            return this;
        }

        /**
         * Factorize logic
         * Return whether or not at least one Collection's component's
         * current state is in the passed state
         *
         * @override
         * @returns {boolean}
         * @memberOf apy.components.Collection
         */
        function isState(state) {
            return this.$components.some(function (comp) {
                return comp.isState(state);
            });
        }

        /**
         *
         * @param items
         * @memberOf apy.components.Collection
         */
        function load (items) {
            for(var i = 0; i < items.length; i++) {
                var resource = items[i];
                this.createResource(resource);
            }
            return this;
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.components.Collection
         */
        function save () {
            return deferredAll([this.create(), this.update()]);
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.components.Collection
         */
        function fetch (progressHandler) {
            var self = this;
            var progress = progressHandler || function (counter) {
                self.$log('Progress handler', counter);
            };
            progress(25);
            return new Promise(function (resolve, reject) {
                self.clear();
                progress(50);
                return self.$access({
                    url: self.$endpoint,
                    method: 'GET'
                }).then(function (response) {
                    progress(75);
                    self.load(response.data._items);
                    progress(100);
                    return resolve(response);
                },
                    function (error) {
                        self.$log('[ApyFrontendError] => ' + error);
                        progress(100);
                        return reject(new $apy.EveHTTPError(error));
                    },
                    function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        self.$log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                        progress(progressPercentage);
                    });
            });
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.components.Collection
         */
        function create () {
            // FIXME: Shall be optimized if `bulk_enabled` is true, making a single request to backend
            var promises = [];
            this.unsavedComponents().forEach(function (comp) {
                var defer = comp.create();
                if(defer) {
                    promises.push(defer);
                }
            });
            return deferredAll(promises);
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.components.Collection
         */
        function update () {
            // FIXME: Shall be optimized if `bulk_enabled` is true, making a single request to backend
            var promises = [];
            this.savedComponents().forEach(function (comp) {
                var defer = comp.update();
                if(defer) {
                    promises.push(defer);
                }
            });
            return deferredAll(promises);
        }

        /**
         * @alias delete
         * @returns {Promise}
         * @memberOf apy.components.Collection
         */
        function del () {
            // FIXME: Shall be optimized using DELETE on root (/) endpoint without ID
            var promises = [];
            this.savedComponents().forEach(function (comp) {
                var defer = comp.delete();
                if(defer) {
                    promises.push(defer);
                }
            });
            this.clear();
            return deferredAll(promises);
        }

        /**
         *
         * @returns {Promise}
         * @memberOf apy.components.Collection
         */
        function clear () {
            this.$components = [];
            return this;
        }

        /**
         *
         * @returns {Integer}
         * @memberOf apy.components.Collection
         * *
         */
        function savedCount () {
            return this.savedComponents().length;
        }

        /**
         *
         * @returns {Array}
         * @memberOf apy.components.Collection
         * *
         */
        function savedComponents () {
            return this.$components.filter(function(comp) {
                return !comp.hasCreated() && !comp.hasUpdated();
            });
        }

        /**
         *
         * @returns {Array}
         * @memberOf apy.components.Collection
         * *
         */
        function unsavedComponents () {
            return this.$components.filter(function(comp) {
                return comp.hasCreated() && comp.hasUpdated();
            });
        }

        /**
         * Collection
         *
         * @param name
         * @param service
         * @param endpoint
         * @param components
         * @constructor
         */
        return function (service, name, endpoint, components) {
            this.initialize(service, name, service.$instance.get(name), null, null, endpoint + name, $apy.helpers.$TYPES.COLLECTION, null, components);
            this.$endpointBase = endpoint;
            this.$Class = $apy.components.Collection;
            if(this.$schema.$embeddedURI)
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
            this.savedCount = savedCount;
            this.removeResource = remove;
            this.hasCreated = hasCreated;
            this.hasUpdated = hasUpdated;
            this.createResource = createResource;
            this.savedComponents = savedComponents;
            this.unsavedComponents = unsavedComponents;

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

})( apy );
