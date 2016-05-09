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
 *  Write here what the module does...
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

        var service = this;

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

        /**
         *
         * @param schema
         * @constructor
         */
        var ApySchemaComponent = function ApySchemaComponent (schema) {
            this.$base = schema;
            self.$hasMedia = false;
            this.$embeddedURI = '';
            this.$headers = Object.keys(schema).filter(function (key) {
                return !key.startsWith('_');
            });
            this.load();
        };

        /**
         * Loads a Schema
         * Computes the `embedded` URI fragment
         * Set `$isEmbeddable` property
         *
         * @returns {ApySchemaComponent}
         */
        ApySchemaComponent.prototype.load = function load () {
            var self = this;
            var embedded = {};
            forEach(this.$base, function (validator, fieldName) {
                self[fieldName] = validator;
                if(isObject(validator) && validator.type) {
                    switch (validator.type) {
                        case $TYPES.MEDIA:
                            self.$hasMedia = true;
                            break;
                        case $TYPES.OBJECTID:
                            if (fieldName !== '_id') {
                                if(validator.data_relation.embeddable) {
                                    embedded[fieldName] = 1;
                                }
                            }
                            break;
                        default :
                            break;
                    }
                }
            });
            if(Object.keys(embedded).length) {
                this.$embeddedURI = 'embedded=' + JSON.stringify(embedded);
            }
            return this;
        };

        /**
         *
         * @param endpoint
         * @param schemas
         * @param excluded
         * @constructor
         */
        var ApySchemasComponent = function ApySchemasComponent (endpoint, schemas, excluded) {
            if(!schemas || !isObject(schemas)) {
                throw new Error('A schemas object must be provided (got type => ' + typeof schemas + ') !');
            }
            this.$names = [];
            this.$humanNames = [];
            this.$components = {};
            this.$componentArray = [];
            this.$endpoint = endpoint;
            this.$schemas = schemas || {};
            this.$excluded = excluded || [];
            this.$template = {
                _id: "",
                _etag: "",
                _links: {
                    self: {
                        href: "",
                        title: ""
                    }
                },
                _created: "",
                _updated: "",
                _deleted: ""
            };
            this.load();
        };

        /**
         *
         * @param schemaName
         * @returns {*}
         */
        ApySchemasComponent.prototype.get = function get (schemaName) {
            return this.$components[schemaName];
        };

        /**
         *
         */
        ApySchemasComponent.prototype.load = function load () {
            var self = this;
            Object.keys(this.$schemas).forEach(function (schemaName) {
                var schema = new ApySchemaComponent(self.$schemas[schemaName]);
                var humanName = schemaName.replaceAll('_', ' ');
                self.$names.push(schemaName);
                self.$humanNames.push(humanName);
                self.$components[schemaName] = schema;
                self.$componentArray.push({
                    data: schema,
                    name: schemaName,
                    route: '/' + schemaName,
                    endpoint: self.$endpoint + schemaName,
                    humanName: humanName,
                    hidden: self.$excluded.indexOf(schemaName) !== -1
                });
            });
        };

        /**
         *
         * @param key
         * @param value
         * @returns {*}
         */
        ApySchemasComponent.prototype.transformData = function transformData(key, value) {
            var val;
            switch (value.type) {
                case $TYPES.LIST:
                    if (value.schema) {
                        val = this.schema2data(value.schema);
                    }
                    else {
                        val = [];
                    }
                    break;
                case $TYPES.DICT:
                    val = this.schema2data(value.schema);
                    break;
                case $TYPES.MEDIA:
                    //val = new ApyMediaFile(this.$endpoint);
                    break;
                case $TYPES.FLOAT:
                case $TYPES.NUMBER:
                    val = 0.0;
                    break;
                case $TYPES.STRING:
                    val = "";
                    break;
                case $TYPES.INTEGER:
                    val = 0;
                    break;
                case $TYPES.BOOLEAN:
                    val = false;
                    break;
                case $TYPES.OBJECTID:
                    if(key.startsWith('_')) {
                        val = "";
                    }
                    else {
                        val = this.schema2data(service.$schemas[value.data_relation.resource]);
                    }
                    break;
                case $TYPES.DATETIME:
                    val = new Date();
                    break;
                default :
                    val = null;
                    break;
            }
            return val;
        };

        /**
         *
         * @param schema
         * @param keyName
         * @returns {*}
         */
        ApySchemasComponent.prototype.schema2data = function schema2data (schema, keyName) {
            var self = this;
            var data = schema ? {} : this.$template;
            if(keyName) {
                data = this.transformData(keyName, schema);
            }
            else {
                forEach(schema, function (value, key) {
                    data[key] = self.transformData(key, value);
                });
            }
            return data;
        };

        /**
         *
         * @param name
         * @param resource
         * @returns {ApyResourceComponent}
         */
        ApySchemasComponent.prototype.createResource = function createResource (name, resource) {
            var schema = this.get(name);
            if(!schema) throw new Error('No schema provided for name', name);
            var component = new ApyResourceComponent(service, name, schema, null, $TYPES.RESOURCE, null, this.$endpoint, name);
            component.load(resource || this.schema2data(schema));
            return component;
        };

        $window.ApySchemasComponent = ApySchemasComponent;
    };

    /**
     *
     * @param schemas
     */
    ApyCompositeService.prototype.setSchemas = function (schemas) {
        var ins = this.$instance = new ApySchemasComponent(this.$endpoint, schemas, this.$config.excludedEndpointByNames);
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
