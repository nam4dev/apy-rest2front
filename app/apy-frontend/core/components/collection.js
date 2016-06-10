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

        var states = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

        /**
         *
         * @returns {ApyCollectionComponent}
         */
        function initRequest () {
            this.$request = this.$schema.$hasMedia ? this.$upload.upload : this.$http;
            //this.$request = this.$upload.upload;
            return this;
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
                if(comp.hasUpdated()) comp.reset();
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
                if(comp.hasUpdated()) updated = true;
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
            return this.setState(states[0]);
        }

        /**
         *
         */
        function setReadState () {
            return this.setState(states[1]);
        }

        /**
         *
         */
        function setUpdateState () {
            return this.setState(states[2]);
        }

        /**
         *
         */
        function setDeleteState () {
            return this.setState(states[3]);
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
        function fetch (progress) {
            var self = this;
            progress && progress(25);
            return new Promise(function (resolve, reject) {
                // FIXME: $upload interface is not a function
                // FIXME: Therefore a facade instance shall be made to unify
                // FIXME: both interfaces, allowing us to always use the `$request` interface
                self.clear();
                progress && progress(50);
                return self.$request({
                    url: self.$endpoint,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'GET'
                }).then(function (response) {
                    progress && progress(90);
                    self.load(response.data._items);
                    progress && progress(100);
                    return resolve(response);
                }).catch(function (error) {
                    progress && progress(0);
                    self.$logging.log("[ApyFrontendError] => " + error);
                    return reject(error);
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
            this.init(service, name, components, $TYPES.COLLECTION);
            this.$endpointBase = endpoint;
            this.$schema = service.$instance.get(name);
            this.$endpoint = endpoint + name;
            this.$Class = $window.ApyCollectionComponent;
            if(this.$schema.$embeddedURI)
                this.$endpoint += '?' + this.$schema.$embeddedURI;

            this.initRequest     = initRequest   ;
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
            this.savedCount      = savedCount    ;

            return this.initRequest();
        }

    })();

    // Inject Mixin
    $window.ApyComponentMixin.call(ApyCollectionComponent.prototype);
    $window.ApyCollectionComponent = ApyCollectionComponent;

})(window);
