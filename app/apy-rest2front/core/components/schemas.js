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
(function($apy) { 'use strict';

    /**
     * Represents a Schema instance.
     * Basically, it represents one of
     * your backend Resource specification (schema)
     *
     * @class apy.components.Schema
     *
     * @example
     * var members = {
     *     lastname: { type: 'string'},
     *     firstname: { type: 'string'},
     *     address: {
     *         type: 'dict',
     *         schema: {
     *             road: { type: 'string'},
     *             street: { type: 'string'},
     *             zipcode: { type: 'integer'},
     *             city: { type: 'string'},
     *         }
     *     }
     * };
     * var apySchema = new apy.components.Schema(members, 'members');
     *
     * @param {Object} schema A schema object
     * @param {string} name The schema name
     * @param {apy.settings._Settings} settings A settings instance
     */
    var Schema = function Schema(schema, name, settings) {
        this.$base = schema;
        this.$name = name;
        this.$hasMedia = false;
        this.$embeddedURI = '';
        this.$bTemplate = settings.bTemplate();
        this.$headers = Object.keys(schema).filter(function(key) {
            return !key.startsWith('_');
        }).sort().reverse();
        this.load();
    };

    /**
     * Recursively load the given schema Object into embedded Object.
     * It aims at finding all embedded Resource(s) to build a valid
     * Eve `embedded` URI fragment.
     *
     * @inner apy.components
     * @param {apy.components.Schema} self Schema instance
     * @param {Object} schema The schema object
     * @param {Object} embedded An object reference to be valuated
     * @param {number} level The depth/level to properly recurse over given object
     */
    function recursiveLoad(self, schema, embedded, level) {
        level = level || 0;
        embedded = embedded || {};
        Object.keys(schema).forEach(function(fieldName) {
            var validator = schema[fieldName];
            if (level === 0) {
                self[fieldName] = validator;
            }
            if (validator.schema) {
                var wrappedSchema = {};
                wrappedSchema[fieldName] = validator.schema;
                recursiveLoad(self, wrappedSchema, embedded, level + 1);
            }
            if ($apy.helpers.isObject(validator) && validator.type) {
                switch (validator.type) {
                    case $apy.helpers.$TYPES.MEDIA:
                        self.$hasMedia = true;
                        break;
                    case $apy.helpers.$TYPES.OBJECTID:
                        if (fieldName !== self.$bTemplate.id) {
                            if (validator.data_relation.embeddable) {
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
     * @memberOf apy.components.Schema
     * @return {apy.components.Schema} itself (chaining pattern)
     */
    Schema.prototype.load = function load() {
        var embedded = {};
        recursiveLoad(this, this.$base, embedded, 0);
        if (this.$bTemplate.embedded.enabled && Object.keys(embedded).length) {
            this.$embeddedURI = this.$bTemplate.embedded.key + '=' + JSON.stringify(embedded);
        }
        return this;
    };

    /**
     * * A Collection of Schema instances
     *
     * @class apy.components.Schemas
     *
     * @example
     * var logs = {
     *     time: { type: 'datetime'},
     *     text: { type: 'string'},
     * };
     *
     * var members = {
     *     lastname: { type: 'string'},
     *     firstname: { type: 'string'},
     *     address: {
     *         type: 'dict',
     *         schema: {
     *             road: { type: 'string'},
     *             street: { type: 'string'},
     *             zipcode: { type: 'integer'},
     *             city: { type: 'string'},
     *         }
     *     }
     * };
     *
     * var activities = {
     *     start: { type: 'datetime'},
     *     end: { type: 'datetime'},
     *     description: { type: 'string'}
     * };
     *
     * var endpoint = 'http://my/api/2/';
     * var schemas = {
     *     logs: logs,
     *     members: members,
     *     activities: activities
     * };
     * var service = apy.CompositeService(...);
     *
     * var apySchemas = new apy.components.Schemas(endpoint, schemas, {
     *     excludedEndpointByNames: ['logs']
     * }, service);
     *
     * @param {string} endpoint REST API endpoint base
     * @param {Object} schemas An object defining each schema associated to its name
     * @param {apy.CompositeService} service Apy Composite service instance
     *
     * @throws {apy.errors.Error}
     */
    var Schemas = function Schemas(endpoint, schemas, service) {
        if (!service || !$apy.helpers.isObject(service)) {
            throw new $apy.errors.Error('A Service object must be provided (got type => ' + typeof service + ') !');
        }
        if (!schemas || !$apy.helpers.isObject(schemas)) {
            throw new $apy.errors.Error('A schemas object must be provided (got type => ' + typeof schemas + ') !');
        }

        this.$names = [];
        this.$humanNames = [];
        this.$components = {};
        this.$service = service;
        this.$componentArray = [];
        this.$endpoint = endpoint;
        this.$settings = $apy.settings.get();
        this.$schemas = schemas || {};
        $.extend(true, this.$schemas, this.$settings.schemaOverrides || {});
        this.$excluded = this.$settings.endpoints.excluded || [];
        this.$template = {
            _id: '',
            _etag: '',
            _links: {
                self: {
                    href: '',
                    title: ''
                }
            },
            _created: '',
            _updated: '',
            _deleted: ''
        };
        this.load();
    };

    /**
     * Create a Resource component based on,
     * given Schema's name and optional payload
     *
     * @memberOf apy.components.Schemas
     *
     * @param {string} name Resource name based on given Schema names
     * @param {Object} payload (optional) Resource payload object
     *
     * @return {apy.components.Resource} Resource component based on given name & payload
     * @throws {apy.errors.Error}
     */
    Schemas.prototype.createResource = function createResource(name, payload) {
        var schema = this.get(name);
        if (!schema) {
            throw new $apy.errors.Error('No schema provided for name', name);
        }
        var value = payload || this.schema2data(schema);
        return new $apy.components.Resource(this.$service, name, schema, value,
            null, this.$endpoint, $apy.helpers.$TYPES.RESOURCE, name);
    };

    /**
     * Get an `apy.components.Schema` instance by its name
     *
     * @memberOf apy.components.Schemas
     *
     * @param {string} schemaName Schema's name
     *
     * @return {apy.components.Schema}
     * @throws {apy.errors.Error}
     */
    Schemas.prototype.get = function get(schemaName) {
        if (!this.$components.hasOwnProperty(schemaName)) {
            throw new $apy.errors.Error('Unknown schema name, ' + schemaName);
        }
        return this.$components[schemaName];
    };

    /**
     * Load all given Schema objects
     *
     * @memberOf apy.components.Schemas
     */
    Schemas.prototype.load = function load() {
        var self = this;
        Object.keys(this.$schemas).forEach(function(schemaName) {
            var schema = new $apy.components.Schema(self.$schemas[schemaName], schemaName, self.$settings);
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
     * Create recursively based on a Schema a matching payload
     *
     * @memberOf apy.components.Schemas
     *
     * @param {string} key Schema's name
     * @param {Object} value Schema object
     *
     * @returns {*} Default value
     */
    Schemas.prototype.transformData = function transformData(key, value) {

        function getDefault(def) {
            return (def && $apy.helpers.isFunction(def)) ? def() : def;
        }

        var val;
        switch (value.type) {
            case $apy.helpers.$TYPES.LIST:
                if (value.schema) {
                    switch (value.schema.type) {
                        case $apy.helpers.$TYPES.OBJECTID:
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
            case $apy.helpers.$TYPES.DICT:
                val = this.schema2data(value.schema);
                break;
            /* istanbul ignore next */
            case $apy.helpers.$TYPES.MEDIA:
                // val = new apy.helpers.MediaFile(this.$endpoint);
                break;
            case $apy.helpers.$TYPES.FLOAT:
            case $apy.helpers.$TYPES.NUMBER:
                val = getDefault(value.default) || 0.0;
                break;
            case $apy.helpers.$TYPES.STRING:
                val = getDefault(value.default) || '';
                break;
            case $apy.helpers.$TYPES.INTEGER:
                val = getDefault(value.default) || 0;
                break;
            case $apy.helpers.$TYPES.BOOLEAN:
                val = getDefault(value.default) || false;
                break;
            case $apy.helpers.$TYPES.OBJECTID:
                if (key && key.startsWith && key.startsWith('_')) {
                    val = '';
                }
                else {
                    val = {};
                    var keyResource = value.data_relation.resource;
                    if (this.$service.$schemas &&
                        this.$service.$schemas.hasOwnProperty(keyResource)) {
                        var $base = this.$service.$schemas[keyResource].$base;
                        if (!key) val = this.schema2data($base, key);
                        else val[key] = this.schema2data($base, key);
                    }
                }
                break;
            case $apy.helpers.$TYPES.DATETIME:
                val = value.default ? new Date(value.default) : new Date();
                break;
            default :
                val = null;
                break;
        }
        return val;
    };

    /**
     * Create recursively based on a Schema a matching payload
     *
     * @memberOf apy.components.Schemas
     *
     * @param {Object} schema Schema object
     * @param {string} keyName key Schema's name
     *
     * @return {Object} A payload based on given schema
     */
    Schemas.prototype.schema2data = function schema2data(schema, keyName) {
        var self = this;
        var data;
        if (keyName) {
            data = this.transformData(keyName, schema);
        }
        else {
            data = schema ? {} : this.$template;
            Object.keys(schema).forEach(function(key) {
                data[key] = self.transformData(key, schema[key]);
            });
        }
        return data;
    };

    $apy.components.Schema = Schema;
    $apy.components.Schemas = Schemas;
})(apy);
