/**
 *  MIT License
 *
 *  This project is a small automated frontend application based on a REST API schema.
 *  It tries to implement a generic data binding upon a REST API system.
 *  For now, python-eve REST API framework has been integrated to Apy Frontend.
 *  For UI components (data representation & bindings), AngularJs is used.
 *  Anyhow, the framework is intended to be plugged to any UI or Backend framework...
 *
 *  Copyright (C) 2016 Namgyal Brisson
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
 *  `apy-frontend`  Copyright (C) 2016 Namgyal Brisson.
 *
 *  """
 *  Core module.
 *
 *  Integrate all Components in a coherent Service module
 *  Could be used through AngularJs (Service factory)
 *  Might be functional for react.js framework integration
 *
 *  """
 */
(function ($window) {'use strict';

    /**
     *  The ApyService provides an Object which will load,
     *  each of your Eve's REST API schema endpoint(s) and gives you:
     *
     *  * A full CRUD MMI for each (Tables, Lists, Forms, ...)
     *  * A configurable endpoint URI
     *  * A configurable CSS theme (default: Bootstrap 3)
     */
    var ApyCompositeService = function ($log, $http, $upload, config) {
        this.$log = $log;
        this.$http = $http;
        this.$config = config;
        this.$upload = $upload;
        this.$theme = config.appTheme;
        this.$syncHttp = new XMLHttpRequest();
        this.$schemas = null;
        this.$endpoint = null;
        this.$instance = null;
        this.$schemasAsArray = null;
        this.$schemasEndpoint = null;
    };

    /**
     *
     * @param schemas
     */
    ApyCompositeService.prototype.setSchemas = function (schemas) {
        var ins = this.$instance = new ApySchemasComponent(this.$endpoint, schemas, this.$config, this);
        this.$schemas = ins.$components;
        this.$schemasAsArray = ins.$componentArray;
        return this;
    };

    /**
     *
     * @returns {ApyCompositeService}
     */
    ApyCompositeService.prototype.loadSchemas = function () {
        this.$syncHttp.open('GET', this.$schemasEndpoint, false);
        this.$syncHttp.send(null);
        return this.setSchemas(JSON.parse(this.$syncHttp.response));
    };

    /**
     *
     * @param endpoint
     * @param schemaName
     * @returns {ApyCompositeService}
     */
    ApyCompositeService.prototype.initEndpoints = function(endpoint, schemaName) {
        this.$endpoint = endpoint;
        this.$schemasEndpoint = endpoint + schemaName;
        return this;
    };

    /**
     *
     * @returns {ApyCompositeService}
     */
    ApyCompositeService.prototype.setDependencies = function() {
        for(var i = 0; i < arguments.length; ++i) {
            //i is always valid index in the arguments object
            this['$' + arguments[i].name] = arguments[i].value;
        }
        return this;
    };

    /**
     *
     * @param name
     * @param components
     * @returns {ApyCollectionComponent|*}
     */
    ApyCompositeService.prototype.createCollection = function(name, components) {
        return new ApyCollectionComponent(this, name, this.$endpoint, components);
    };

    $window.ApyCompositeService = ApyCompositeService;

})(window);
