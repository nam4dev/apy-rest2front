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
 *  Apy Collection Component abstraction
 *
 *  """
 */
(function ($window) {

    $window.ApyCollectionComponent = (function () {

        var STATES = {
            CREATE: 'CREATE',
            READ: 'READ',
            UPDATE: 'UPDATE',
            DELETE: 'DELETE'
        };

        function toString() {
            return '[' + this.$components.join(', ') + ']';
        }

        /**
         *
         * @param resource
         * @returns {ApyResourceComponent}
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
         */
        function remove (resource) {
            return this.$components.splice(this.$components.indexOf(resource), 1);
        }

        /**
         *
         */
        function reset () {
            this.$components.forEach(function (comp) {
                comp.reset();
            });
        }

        /**
         *
         * @returns {boolean}
         */
        function hasCreated () {
            var created = false;
            this.$components.forEach(function (comp) {
                if(comp.hasCreated()) created = true;
            });
            return created;
        }

        /**
         *
         * @returns {boolean}
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
         * @param state
         * @returns {ApyCollectionComponent}
         */
        function setState (state) {
            this.$components.forEach(function (comp) {
                comp.$states.set(state);
            });
            return this;
        }

        /**
         *
         */
        function setCreateState () {
            return this.setState(STATES.CREATE);
        }

        /**
         *
         */
        function setReadState () {
            return this.setState(STATES.READ);
        }

        /**
         *
         */
        function setUpdateState () {
            return this.setState(STATES.UPDATE);
        }

        /**
         *
         */
        function setDeleteState () {
            return this.setState(STATES.DELETE);
        }

        /**
         *
         * @param items
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
         */
        function save () {
            return this.create().update();
        }

        /**
         *
         * @returns {Promise}
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
                return self.$request({
                    url: self.$endpoint,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'GET'
                }).then(function (response) {
                        progress(75);
                        self.load(response.data._items);
                        progress(100);
                        return resolve(response);
                    },
                    function (error) {
                        self.$log("[ApyFrontendError] => " + error);
                        return reject(error);
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
         */
        function create () {
            this.$components.forEach(function (comp) {
                comp.create();
            });
            return this;
        }

        /**
         *
         * @returns {Promise}
         */
        function update () {
            this.$components.forEach(function (comp) {
                comp.update();
            });
            return this;
        }

        /**
         *
         * @returns {Promise}
         */
        function del () {
            this.$components.forEach(function (comp) {
                comp.delete();
            });
            return this.clear();
        }

        /**
         *
         * @returns {Promise}
         */
        function clear () {
            this.$components = [];
            return this;
        }

        /**
         *
         * @returns {Integer}
         * *
         */
        function savedCount () {
            var savedCount = 0;
            this.$components.forEach(function (comp) {
                if(comp._id) savedCount++;
            });
            return savedCount;
        }

        /**
         * ApyCollectionComponent
         *
         * @param name
         * @param service
         * @param endpoint
         * @param components
         * @constructor
         */
        return function (service, name, endpoint, components) {
            this.initialize(service, name, service.$instance.get(name), null, null, endpoint + name, $TYPES.COLLECTION, null, components);
            this.$endpointBase = endpoint;
            this.$Class = $window.ApyCollectionComponent;
            if(this.$schema.$embeddedURI)
                this.$endpoint += '?' + this.$schema.$embeddedURI;

            this.createResource  = createResource;
            this.removeResource  = remove        ;
            this.reset           = reset         ;
            this.hasCreated      = hasCreated    ;
            this.hasUpdated      = hasUpdated    ;
            this.setState        = setState      ;
            this.setCreateState  = setCreateState;
            this.setReadState    = setReadState  ;
            this.setUpdateState  = setUpdateState;
            this.setDeleteState  = setDeleteState;
            this.load            = load          ;
            this.save            = save          ;
            this.fetch           = fetch         ;
            this.create          = create        ;
            this.update          = update        ;
            this.delete          = del           ;
            this.clear           = clear         ;
            this.toString        = toString      ;
            this.savedCount      = savedCount    ;

            return this;
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyCollectionComponent.prototype);

})(window);
