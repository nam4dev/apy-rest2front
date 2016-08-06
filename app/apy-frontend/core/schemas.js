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
 *  Schemas mapping management
 *
 *  Compute embedded URI
 *  Compose Resource Component
 *
 *  """
 */
(function ($window) { 'use strict';

    /**
     * Represents a Schema instance.
     * Basically, it represents one of
     * your backend Resource specification (schema)
     *
     * @param schema
     * @param name
     * @constructor
     */
    var ApySchemaComponent = function ApySchemaComponent (schema, name) {
        this.$base = schema;
        this.$name = name;
        this.$hasMedia = false;
        this.$embeddedURI = '';
        this.$headers = Object.keys(schema).filter(function (key) {
            return !key.startsWith('_');
        }).sort().reverse();
        this.load();
    };

    function recursiveLoad(self, schema, embedded, level) {
        level = level || 0;
        embedded = embedded || {};
        forEach(schema, function (validator, fieldName) {
            if(level === 0) {
                self[fieldName] = validator;
            }
            if(validator.schema) {
                var wrappedSchema = {};
                wrappedSchema[fieldName] = validator.schema;
                recursiveLoad(self, wrappedSchema, embedded, level + 1);
            }
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
    }

    /**
     * Loads a Schema
     * Computes the `embedded` URI fragment
     * Evaluates `$isEmbeddable` property
     *
     * @returns {ApySchemaComponent}
     */
    ApySchemaComponent.prototype.load = function load () {
        var embedded = {};
        recursiveLoad(this, this.$base, embedded);
        if(Object.keys(embedded).length) {
            this.$embeddedURI = 'embedded=' + JSON.stringify(embedded);
        }
        return this;
    };

    /**
     * A Collection of Schema instances
     *
     * @param endpoint
     * @param schemas
     * @param config
     * @param service
     *
     * @constructor
     */
    var ApySchemasComponent = function ApySchemasComponent (endpoint, schemas, config, service) {
        if(!service || !isObject(service)) {
            throw new ApyError('A Service object must be provided (got type => ' + typeof service + ') !');
        }
        if(!schemas || !isObject(schemas)) {
            throw new ApyError('A schemas object must be provided (got type => ' + typeof schemas + ') !');
        }
        this.$names = [];
        this.$humanNames = [];
        this.$components = {};
        this.$service = service;
        this.$componentArray = [];
        this.$endpoint = endpoint;
        this.$config = config || {};
        this.$schemas = schemas || {};
        $.extend(true, this.$schemas, this.$config.schemas || {});
        this.$excluded = this.$config.excludedEndpointByNames || [];
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
     * @param name
     * @param resource
     * @returns {ApyResourceComponent}
     */
    ApySchemasComponent.prototype.createResource = function createResource (name, resource) {
        var schema = this.get(name);
        if(!schema) {
            throw new ApyError('No schema provided for name', name);
        }
        var value = resource || this.schema2data(schema);
        return new ApyResourceComponent(this.$service, name, schema, value, null, this.$endpoint, $TYPES.RESOURCE, name);
    };

    /**
     *
     * @param schemaName
     * @returns {*}
     */
    ApySchemasComponent.prototype.get = function get (schemaName) {
        if(!this.$components.hasOwnProperty(schemaName)) {
            throw new ApyError('Unknown schema name, ' + schemaName);
        }
        return this.$components[schemaName];
    };

    /**
     *
     */
    ApySchemasComponent.prototype.load = function load () {
        var self = this;
        Object.keys(this.$schemas).forEach(function (schemaName) {
            var schema = new ApySchemaComponent(self.$schemas[schemaName], schemaName);
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
                    switch(value.schema.type) {
                        case $TYPES.OBJECTID:
                            val = [];
                            break;
                        default :
                            val = [this.transformData(undefined, value.schema)];
                            break;
                    }
                }
                else {
                    val = [];
                }
                break;
            case $TYPES.DICT:
                val = this.schema2data(value.schema);
                break;
            /* istanbul ignore next */
            case $TYPES.MEDIA:
                //val = new ApyMediaFile(this.$endpoint);
                break;
            case $TYPES.FLOAT:
            case $TYPES.NUMBER:
                val = value.default || 0.0;
                break;
            case $TYPES.STRING:
                val = value.default || "";
                break;
            case $TYPES.INTEGER:
                val = value.default || 0;
                break;
            case $TYPES.BOOLEAN:
                val = value.default || false;
                break;
            case $TYPES.OBJECTID:
                if(key && key.startsWith && key.startsWith('_')) {
                    val = "";
                }
                else {
                    var keyResource = value.data_relation.resource;
                    if(this.$service.$schemas &&
                        this.$service.$schemas.hasOwnProperty(keyResource)) {
                        var $base = this.$service.$schemas[keyResource].$base;
                        val = this.schema2data($base);
                    }
                    else {
                        val = {}
                    }
                }
                break;
            case $TYPES.DATETIME:
                val = value.default ? new Date(value.default) : new Date();
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
        var data;
        if(keyName) {
            data = this.transformData(keyName, schema);
        }
        else {
            data = schema ? {} : this.$template;
            forEach(schema, function (value, key) {
                data[key] = self.transformData(key, value);
            });
        }
        return data;
    };

    $window.ApySchemasComponent = ApySchemasComponent;

})(window);