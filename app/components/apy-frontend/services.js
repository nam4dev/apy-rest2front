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

        /**
         *
         * @param parentClassOrObject
         * @returns {Function}
         */
        Function.prototype.inheritsFrom = function(parentClassOrObject){
            if (parentClassOrObject.constructor == Function)
            {
                //Normal Inheritance
                this.prototype = new parentClassOrObject;
                this.prototype.constructor = this;
                this.prototype.$parent = parentClassOrObject.prototype;
            }
            else
            {
                //Pure Virtual Inheritance
                this.prototype = parentClassOrObject;
                this.prototype.constructor = this;
                this.prototype.$parent = parentClassOrObject;
            }
            return this;
        };

        if (!Object.assign) {
            Object.defineProperty(Object, 'assign', {
                enumerable: false,
                configurable: true,
                writable: true,
                value: function(target) {
                    'use strict';
                    if (target === undefined || target === null) {
                        throw new TypeError('Cannot convert first argument to object');
                    }

                    var to = Object(target);
                    for (var i = 1; i < arguments.length; i++) {
                        var nextSource = arguments[i];
                        if (nextSource === undefined || nextSource === null) {
                            continue;
                        }
                        nextSource = Object(nextSource);

                        var keysArray = Object.keys(nextSource);
                        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                            var nextKey = keysArray[nextIndex];
                            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                            if (desc !== undefined && desc.enumerable) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                    return to;
                }
            });
        }

        String.prototype.replaceAll = function(target, replacement) {
            return this.split(target).join(replacement);
        };

        String.prototype.capitalize = function() {
            var lower = this.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        };

        // Borrowed to AngularJs framework
        /**
         * @name forEach
         * @kind function
         *
         * @description
         * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
         * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
         * is the value of an object property or an array element, `key` is the object property key or
         * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
         *
         * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
         * using the `hasOwnProperty` method.
         *
         * Unlike ES262's
         * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
         * Providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
         * return the value provided.
         *
         ```js
         var values = {name: 'misko', gender: 'male'};
         var log = [];
         forEach(values, function(value, key) {
           this.push(key + ': ' + value);
         }, log);
         expect(log).toEqual(['name: misko', 'gender: male']);
         ```
         *
         * @param {Object|Array} obj Object to iterate over.
         * @param {Function} iterator Iterator function.
         * @param {Object=} context Object to become context (`this`) for the iterator function.
         * @returns {Object|Array} Reference to `obj`.
         */
        function forEach(obj, iterator, context) {
            var key, length;
            if (obj) {
                if (isFunction(obj)) {
                    for (key in obj) {
                        // Need to check if hasOwnProperty exists,
                        // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                        if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                } else if (isArray(obj) || isArrayLike(obj)) {
                    var isPrimitive = typeof obj !== 'object';
                    for (key = 0, length = obj.length; key < length; key++) {
                        if (isPrimitive || key in obj) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                } else if (obj.forEach && obj.forEach !== forEach) {
                    obj.forEach(iterator, context, obj);
                } else if (isBlankObject(obj)) {
                    // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
                    for (key in obj) {
                        iterator.call(context, obj[key], key, obj);
                    }
                } else if (typeof obj.hasOwnProperty === 'function') {
                    // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                } else {
                    // Slow path for objects which do not have a method `hasOwnProperty`
                    for (key in obj) {
                        if (hasOwnProperty.call(obj, key)) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                }
            }
            return obj;
        }

        // Inspired by http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
        var Helper = function () {};

        /**
         *
         * @param array
         * @param other
         * @returns {boolean}
         */
        Helper.prototype.arrayEquals = function (array, other) {
            // if the other array is a falsy value, return
            if (!other)
                return false;

            // compare lengths - can save a lot of time
            if (array.length != other.length)
                return false;

            for (var i = 0, l=array.length; i < l; i++) {
                // Check if we have nested arrays
                if (array[i] instanceof Array && other[i] instanceof Array) {
                    // recurse into the nested arrays
                    if (!array[i].equals(other[i]))
                        return false;
                }
                else if (array[i] != other[i]) {
                    // Warning - two different object instances will never be equal: {x:20} != {x:20}
                    return false;
                }
            }
            return true;
        };

        // TODO: Commented as not used for now, if not needed at all at the end, just remove it!
        ///**
        // *
        // * @param array
        // * @param thing
        // * @returns {boolean}
        // */
        //Helper.prototype.arrayContains = function (array, thing) {
        //    // if the other array is a falsy value, return false
        //    if (!array)
        //        return false;
        //    //start by assuming the array doesn't contain the thing
        //    var result = false;
        //    for (var i = 0, l=array.length; i < l; i++)
        //    {
        //        //if anything in the array is the thing then change our mind from before
        //        if (array[i] instanceof Array)
        //        {if (array[i].equals(thing))
        //            result = true;}
        //        else
        //        if (array[i]===thing)
        //            result = true;
        //    }
        //    //return the decision we left in the variable, result
        //    return result;
        //};
        //
        ///**
        // *
        // * @param array
        // * @param thing
        // * @returns {number}
        // */
        //Helper.prototype.arrayIndexOf = function (array, thing) {
        //    // if the other array is a falsy value, return -1
        //    if (!array)
        //        return -1;
        //    //start by assuming the array doesn't contain the thing
        //    var result = -1;
        //    for (var i = 0, l=array.length; i < l; i++)
        //    {
        //        //if anything in the array is the thing then change our mind from before
        //        if (array[i] instanceof Array)
        //            if (array[i].equals(thing))
        //                result = i;
        //            else
        //            if (array[i]===thing)
        //                result = i;
        //    }
        //    //return the decision we left in the variable, result
        //    return result;
        //};

        /**
         * @name isUndefined
         * @kind function
         *
         * @description
         * Determines if a reference is undefined.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is undefined.
         */
        function isUndefined(value) {return typeof value === 'undefined';}


        /**
         * @name isDefined
         * @kind function
         *
         * @description
         * Determines if a reference is defined.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is defined.
         */
        function isDefined(value) {return typeof value !== 'undefined';}


        /**
         * @name isObject
         * @kind function
         *
         * @description
         * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
         * considered to be objects. Note that JavaScript arrays are objects.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is an `Object` but not `null`.
         */
        function isObject(value) {
            // http://jsperf.com/isobject4
            return value !== null && typeof value === 'object';
        }


        /**
         * Determine if a value is an object with a null prototype
         *
         * @returns {boolean} True if `value` is an `Object` with a null prototype
         */
        function isBlankObject(value) {
            return value !== null && typeof value === 'object' && !getPrototypeOf(value);
        }


        /**
         * @name isString
         * @kind function
         *
         * @description
         * Determines if a reference is a `String`.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is a `String`.
         */
        function isString(value) {return typeof value === 'string';}


        /**
         * @name isNumber
         * @kind function
         *
         * @description
         * Determines if a reference is a `Number`.
         *
         * This includes the "special" numbers `NaN`, `+Infinity` and `-Infinity`.
         *
         * If you wish to exclude these then you can use the native
         * [`isFinite'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)
         * method.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is a `Number`.
         */
        function isNumber(value) {return typeof value === 'number';}


        /**
         * @name isDate
         * @kind function
         *
         * @description
         * Determines if a value is a date.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is a `Date`.
         */
        function isDate(value) {
            return toString.call(value) === '[object Date]';
        }


        /**
         * @name isArray
         * @kind function
         *
         * @description
         * Determines if a reference is an `Array`.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is an `Array`.
         */
        var isArray = Array.isArray;

        /**
         * @name isFunction
         * @kind function
         *
         * @description
         * Determines if a reference is a `Function`.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is a `Function`.
         */
        function isFunction(value) {return typeof value === 'function';}


        /**
         * Determines if a value is a regular expression object.
         *
         * @private
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is a `RegExp`.
         */
        function isRegExp(value) {
            return toString.call(value) === '[object RegExp]';
        }


        /**
         * Checks if `obj` is a window object.
         *
         * @private
         * @param {*} obj Object to check
         * @returns {boolean} True if `obj` is a window obj.
         */
        function isWindow(obj) {
            return obj && obj.window === obj;
        }


        function isFile(obj) {
            return toString.call(obj) === '[object File]';
        }


        function isFormData(obj) {
            return toString.call(obj) === '[object FormData]';
        }


        function isBlob(obj) {
            return toString.call(obj) === '[object Blob]';
        }


        function isBoolean(value) {
            return typeof value === 'boolean';
        }


        function isPromiseLike(obj) {
            return obj && isFunction(obj.then);
        }

        /**
         * @private
         * @param {*} obj
         * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
         *                   String ...)
         */
        function isArrayLike(obj) {
            if (obj == null || isWindow(obj)) {
                return false;
            }

            // Support: iOS 8.2 (not reproducible in simulator)
            // "length" in obj used to prevent JIT error (gh-11508)
            var length = "length" in Object(obj) && obj.length;

            if (obj.nodeType === NODE_TYPE_ELEMENT && length) {
                return true;
            }

            return isString(obj) || isArray(obj) || length === 0 ||
                typeof length === 'number' && length > 0 && (length - 1) in obj;
        }

        var NODE_TYPE_ELEMENT = 1;

        var service             = this,
            getPrototypeOf      = Object.getPrototypeOf,
            toString            = Object.prototype.toString,
            hasOwnProperty      = Object.prototype.hasOwnProperty,
            states              = [
                'CREATE',
                'READ',
                'UPDATE',
                'DELETE'
            ];

        var ApyStateHolder = function (initialState, states) {
            this.$states = states;
            this.$current = initialState;
            this.load();
        };

        ApyStateHolder.prototype.set = function (state) {
            this.$current = state;
            return this;
        };

        ApyStateHolder.prototype.load = function () {
            var self = this;
            forEach(this.$states, function (value) {
                var attr = value.toUpperCase();
                self[attr] = attr;
            });
            return this;
        };

        //$window.ApyStackComponent = ApyStateHolder;

        this.$log = $log;
        this.$http = $http;
        this.$config = config;
        this.$upload = $upload;
        this.$theme = config.appTheme;
        this.$syncHttp = new XMLHttpRequest();

        this.$schemas = null;
        this.$schemasEndpoint = null;

        /**
         * Component Interface for the "tree" pattern implementation.constructor.
         * Note: This can be inherited but not instantiated.
         *
         * @type IComponent
         */
        var IComponent = {
            // Self props
            $types: {
                LIST: "list",
                DICT: "dict",
                MEDIA: "media",
                STRING: "string",
                INTEGER: "integer",
                OBJECTID: "objectid",
                DATETIME: "datetime",
                RESOURCE: "resource"
            },
            $typesMap : {
                number: ["integer"],
                object: ["datetime", "objectid", "dict", "list"]
            },
            /**
             * Logging method
             *
             * @param message
             */
            log: function(message) {
                if(!this.hasOwnProperty('logging')) {
                    this.setLogging();
                }
                this.$logging.log(message);
                return this;
            },
            /**
             *
             * @param child
             * @returns {IComponent}
             */
            add: function (child) {
                this.$components.push(child);
                return this;
            },
            /**
             *
             * @param child
             * @returns {IComponent}
             */
            prepend: function (child) {
                this.$components.unshift(child);
                return this;
            },
            /**
             *
             * @returns {Number}
             */
            count: function () {
                return this.$components.length;
            },
            /**
             *
             * @param child
             * @returns {IComponent}
             */
            remove: function (child) {
                var length = this.count();
                for (var i = 0; i < length; i++) {
                    if (this.getChild(i) === child) {
                        this.$components.splice(i, 1);
                        break;
                    }
                }
                return this;
            },
            /**
             *
             * @param i
             * @returns {*}
             */
            getChild: function (i) {
                return this.$components[i];
            },
            /**
             *
             * @returns {boolean}
             */
            hasChildren: function () {
                return this.$components.length > 0;
            },
            /**
             *
             * @returns {Array}
             */
            cleanedData: function () {
                var cleaned = [];
                for (var i = 0; i < this.count(); i++) {
                    var item = this.getChild(i);
                    if(item.hasUpdated())
                        cleaned.push(item.cleanedData());
                }
                return cleaned;
            },
            /**
             *
             */
            isFunction: isFunction,
            isArray: isArray
        };

        /**
         * ApyComponent
         *
         * @param name
         * @param type
         * @param components
         * @constructor
         */
        var ApyComponent = function ApyComponent (name, type, components=null) {
            this.$name = name;
            this.$type = type;
            // Dependencies inherited from Angular
            this.$http = $http;
            this.$logging = $log;
            this.$upload = $upload;
            // components index
            this.$components = components || [];
            this.$components = this.isArray(this.$components) ? this.$components : [this.$components];
            // Design related
            this.$contentUrl = 'field-' + type + '.html';
            this.init();
        };

        ApyComponent.inheritsFrom(IComponent);

        /**
         *
         * @returns {ApyComponent}
         */
        ApyComponent.prototype.logChildren = function logTypes () {
            var ChildLogger = (function ($log) {
                return function ChildLogger(child, index, array) {
                    if(!child.hasChildren()) {
                        $log.log(child);
                    }
                    else {
                        $log.log("Logging sub-" + child.$type + " `" + child.$name + "`...");
                        child.logChildren();
                    }
                }
            })(this.$logging);
            this.$components.forEach(ChildLogger);
            return this;
        };

        /**
         *
         * @returns {ApyComponent}
         */
        ApyComponent.prototype.validate = function validate () {
            return this;
        };

        /**
         *
         */
        ApyComponent.prototype.init = function init () {
            return this.validate();
        };

        /**
         *
         * @param schema
         * @constructor
         */
        var ApySchemaComponent = function ApySchemaComponent (schema) {
            this.$base = schema;
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
                        case "objectid":
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
        var ApySchemasComponent = function ApySchemasComponent (endpoint, schemas, excluded=null) {
            if(!schemas || !isObject(schemas)) {
                throw new Error('A schemas object must be provided (got type => ' + typeof schemas + ') !');
            }
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

        ApySchemasComponent.prototype.get = function get (schemaName) {
            return this.$components[schemaName];
        };

        ApySchemasComponent.prototype.load = function load () {
            var self = this;
            Object.keys(this.$schemas).forEach(function (schemaName) {
                var schema = new ApySchemaComponent(self.$schemas[schemaName]);
                self.$components[schemaName] = schema;
                self.$componentArray.push({
                    data: schema,
                    name: schemaName,
                    route: '/' + schemaName,
                    endpoint: self.$endpoint + schemaName,
                    humanName: schemaName.replaceAll('_', ' '),
                    hidden: self.$excluded.indexOf(schemaName) !== -1
                });
            });
        };

        ApySchemasComponent.prototype.transformData = function transformData(key, value) {
            var val;
            switch (value.type) {
                case "list":
                    val = [];
                    break;
                case "dict":
                    val = this.schema2data(value.schema);
                    break;
                case "media":
                    val = {};
                    break;
                case 'string':
                    val = "";
                    break;
                case "integer":
                    val = -1;
                    break;
                case "objectid":
                    if(key.startsWith('_')) {
                        val = "";
                    }
                    else {
                        val = this.schema2data(service.$schemas[value.data_relation.resource]);
                    }
                    break;
                case "datetime":
                    val = new Date();
                    break;
                default :
                    val = null;
                    break;
            }
            return val;
        };

        ApySchemasComponent.prototype.schema2data = function schema2data (schema=null, keyName=null) {
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

        ApySchemasComponent.prototype.createResource = function createResource (name, resource=null) {
            var schema = this.get(name);
            if(!schema) throw new Error('No schema provided for name', name);
            var component = new ApyResourceComponent(name, schema);
            component.$endpointBase = this.$endpoint;
            component.load(resource || this.schema2data(schema));
            return component;
        };


        /**
         * ApyCollectionComponent
         *
         * @param name
         * @param endpoint
         * @param components
         * @constructor
         */
        var ApyCollectionComponent = function ApyCollectionComponent (name, endpoint, components=null) {
            this.$endpointBase = endpoint;
            this.$schema = service.$instance.get(name);
            this.$endpoint = endpoint + name + '?' + this.$schema.$embeddedURI;
            this.$parent.constructor.call(this, name, "collection", components);
        };

        ApyCollectionComponent.inheritsFrom(ApyComponent);

        ApyCollectionComponent.prototype.createResource = function createResource (resource) {
            var component = service.$instance.createResource(this.$name, resource);
            this.prepend(component);
            return component;
        };

        ApyCollectionComponent.prototype.removeResource = function remove (resource) {
            return this.$components.splice(this.$components.indexOf(resource), 1);
        };

        ApyCollectionComponent.prototype.reset = function reset () {
            this.$components.forEach(function (comp) {
                comp.reset();
            });
        };

        ApyCollectionComponent.prototype.hasCreated = function hasCreated () {
            var created = false;
            this.$components.forEach(function (comp) {
                if(comp.hasCreated()) created = true;
            });
            return created;
        };

        ApyCollectionComponent.prototype.hasUpdated = function hasUpdated () {
            var updated = false;
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated()) updated = true;
            });
            return updated;
        };

        /**
         *
         * @param state
         * @returns {ApyCollectionComponent}
         */
        ApyCollectionComponent.prototype.setState = function setState (state) {
            this.$components.forEach(function (comp) {
                comp.$states.set(state);
            });
            return this;
        };

        /**
         *
         */
        ApyCollectionComponent.prototype.setCreateState = function setCreateState () {
            return this.setState(states[0]);
        };

        /**
         *
         */
        ApyCollectionComponent.prototype.setReadState = function setReadState () {
            return this.setState(states[1]);
        };

        /**
         *
         */
        ApyCollectionComponent.prototype.setUpdateState = function setUpdateState () {
            return this.setState(states[2]);
        };

        /**
         *
         */
        ApyCollectionComponent.prototype.setDeleteState = function setDeleteState () {
            return this.setState(states[3]);
        };

        /**
         *
         * @param items
         */
        ApyCollectionComponent.prototype.load = function load (items) {
            for(var i = 0; i < items.length; i++) {
                var resource = items[i];
                this.createResource(resource);
            }
            return this;
        };

        /**
         *
         * @returns {Promise}
         */
        ApyCollectionComponent.prototype.save = function save () {
            return this.create().update();
        };

        /**
         *
         * @returns {Promise}
         */
        ApyCollectionComponent.prototype.fetch = function fetch () {
            var self = this;
            return new Promise(function (resolve, reject) {
                return self.$http({
                    url: self.$endpoint,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'GET'
                }).then(function (response) {
                    self.load(response.data._items);
                    return resolve(response);
                }).catch(function (error) {
                    self.$logging.log("[APY-EVE-ERROR] => " + error);
                    return reject(error);
                });
            });
        };

        /**
         *
         * @returns {Promise}
         */
        ApyCollectionComponent.prototype.create = function create () {
            this.$components.forEach(function (comp) {
                comp.create();
            });
            return this;
        };

        /**
         *
         * @returns {Promise}
         */
        ApyCollectionComponent.prototype.update = function update () {
            this.$components.forEach(function (comp) {
                comp.update();
            });
            return this;
        };

        /**
         *
         * @returns {Promise}
         */
        ApyCollectionComponent.prototype.delete = function del () {
            this.$components.forEach(function (comp) {
                comp.delete();
            });
            return this;
        };

        /**
         *
         * @returns {Promise}
         * *
         */
        ApyCollectionComponent.prototype.savedCount = function savedCount () {
            var savedCount = 0;
            this.$components.forEach(function (comp) {
                if(comp._id) savedCount++;
            });
            return savedCount;
        };

        /**
         * ApyResourceComponent
         *
         * @param name
         * @param type
         * @param schema
         * @param $states
         * @param components
         * @param endpointBase
         * @constructor
         */
        var ApyResourceComponent = function ApyResourceComponent (name, schema, components=null, type="resource", $states=null, endpointBase=null, relationName=null) {
            this.$parent.constructor.call(this, name, type, components);
            this.$value = '';
            this.$schema = schema;
            this.$relationName = relationName;
            this.$endpointBase = endpointBase + relationName;
            this.$endpoint = this.$endpointBase + '?' + schema.$embeddedURI;
            this.$states = $states || this.createStateHolder(states[1], states);
        };

        ApyResourceComponent.inheritsFrom(ApyComponent);

        ApyResourceComponent.prototype.toString = function () {
            var filtered = this.$components.filter(function (c) {
                return c.$required;
            });
            if(filtered.length)
                return '[' + filtered.join(', ') + ']';

            filtered = this.$components.filter(function (c) {
                return c.$value;
            });
            return '[' + filtered.join(', ') + ']';
        };

        /**
         *
         */
        ApyResourceComponent.prototype.setCreateState = function setCreateState () {
            this.$states.set(states[0]);
            return this;
        };

        /**
         *
         */
        ApyResourceComponent.prototype.setReadState = function setReadState () {
            this.$states.set(states[1]);
            return this;
        };

        /**
         *
         */
        ApyResourceComponent.prototype.setUpdateState = function setUpdateState () {
            this.$states.set(states[2]);
            return this;
        };

        /**
         *
         */
        ApyResourceComponent.prototype.setDeleteState = function setDeleteState () {
            this.$states.set(states[3]);
            return this;
        };

        ApyResourceComponent.prototype.reset = function reset () {
            this.$components.forEach(function (comp) {
                comp.reset();
            });
        };

        ApyResourceComponent.prototype.hasCreated = function hasCreated () {
            var pkAttributeName = service.$config.pkName;
            return this.hasOwnProperty(pkAttributeName) && !this[pkAttributeName];
        };

        ApyResourceComponent.prototype.hasUpdated = function hasUpdated () {
            var updated = false;
            this.$components.forEach(function (comp) {
                if(comp.hasUpdated()) updated = true;
            });
            return updated;
        };

        ApyResourceComponent.prototype.updateSelf = function updateSelf (update, commit=false) {
            var self = this;
            update = update || {};
            // Copy private properties such as _id, _etag, ...
            forEach(update, function (value, name) {
                if(self.continue(name)) {
                    self[name] = value
                }
            });
            forEach(this.$schema.$base, function (_, fieldName) {
                self.$components.forEach(function (comp) {
                    if(update.hasOwnProperty(fieldName) && comp.$name === fieldName) {
                        comp.updateSelf(update[fieldName], commit);
                    }
                });
            });
            return this;
        };

        ApyResourceComponent.prototype.loadResponse = function loadResponse (response) {
            var self = this;
            forEach(response.data, function (v, k) {
                self[k] = v;
            });
            return this;
        };

        ApyResourceComponent.prototype.createRequest = function createRequest (method='POST') {
            var self = this;
            return new Promise(function (resolve, reject) {
                var uri = self.$endpointBase;
                var data = null;
                var headers = {
                    'Content-Type': 'application/json'
                };
                var setConfig = function () {
                    uri += '/' + self._id;
                    headers['If-Match'] = self._etag;
                };
                switch (method) {
                    case 'POST':
                        data = self.cleanedData();
                        break;
                    case 'PATCH':
                        setConfig();
                        data = self.cleanedData();
                        break;
                    case 'DELETE':
                        setConfig();
                        break;
                    default :
                        break;
                }
                return self.$http({
                    url: uri,
                    headers: headers,
                    method: method,
                    data: data
                }).then(function (response) {
                    self.$logging.debug(response);
                    self.loadResponse(response);
                    self.setReadState();
                    return resolve(response);
                }).catch(function (error) {
                    self.$logging.error(error);
                    return reject(error);
                });
            });
        };

        /**
         *
         * @returns {Promise}
         */
        ApyResourceComponent.prototype.create = function create () {
            if(this.hasCreated() && this.hasUpdated()) {
                return this.createRequest();
            }
            else {
                this.setReadState();
            }
        };

        /**
         *
         * @returns {Promise}
         */
        ApyResourceComponent.prototype.update = function update () {
            if(this.hasUpdated()) {
                return this.createRequest('PATCH');
            }
            else {
                this.setReadState();
            }
        };

        /**
         *
         * @returns {Promise}
         */
        ApyResourceComponent.prototype.delete = function del () {
            if(!this.hasCreated()) {
                return this.setDeleteState().createRequest('DELETE');
            }
        };

        /**
         *
         * @param states
         * @param initialState
         */
        ApyResourceComponent.prototype.createStateHolder = function createStateHolder (initialState, states) {
            return new ApyStateHolder(initialState, states);
        };

        /**
         *
         * @param char
         * @param field
         * @returns {boolean}
         */
        ApyResourceComponent.prototype.continue = function shallContinue (field, char='_') {
            return field.startsWith && field.startsWith(char);
        };

        /**
         *
         * @param resource
         */
        ApyResourceComponent.prototype.load = function load (resource) {
            var field;
            for (field in resource) {
                if(resource.hasOwnProperty(field) && this.continue(field)) {
                    this[field] = resource[field];
                }
            }
            for (field in this.$schema) {
                if(!this.$schema.hasOwnProperty(field) ||
                    this.continue(field) ||
                    this.continue(field, '$')) {
                    continue;
                }
                var subSchema = this.$schema[field];
                try {
                    var type = subSchema.type;
                }
                catch(e) {
                    continue;
                }
                var fieldObj,
                    value = resource[field] || service.$instance.schema2data(subSchema, field);
                switch(type) {
                    case this.$types.DICT:
                        fieldObj = new ApyResourceComponent(field, subSchema.schema, null, 'resource', this.$states);
                        //fieldObj.$endpointBase = this.$endpointBase;
                        fieldObj.load(value);
                        break;
                    //case this.$types.LIST:
                    //    fieldObj = new ApyResourceComponent(field, subSchema, resource[field]);
                    //    break;
                    //case this.$types.MEDIA:
                    //    fieldObj = new ApyResourceComponent(field, subSchema, resource[field]);
                    //    break;
                    case this.$types.OBJECTID:
                        var relationName = subSchema.data_relation.resource;
                        fieldObj = new ApyResourceComponent(field,
                            service.$schemas[relationName],
                            null, 'objectid', this.$states, this.$endpointBase, relationName);
                        //fieldObj.$endpointBase = this.$endpointBase + subSchema.data_relation.resource;

                        fieldObj.loadObjectid(value);
                        break;
                    default:
                        fieldObj = new ApyFieldComponent(field, type, value, subSchema, this.$states);
                        break;
                }
                this.add(fieldObj);
            }
            this.loadValue();
            return this;
        };

        /**
         *
         * @returns {{}}
         */
        ApyResourceComponent.prototype.cleanedData = function cleanedData () {
            var cleaned = {};
            for (var i = 0; i < this.count(); i++) {
                var data;
                var item = this.$components[i];
                switch (item.$type) {
                    case 'objectid':
                        data = item._id;
                        break;
                    default :
                        data = item.cleanedData();
                        break;
                }
                cleaned[item.$name] = data;
            }
            return cleaned;
        };

        ApyResourceComponent.prototype.loadValue = function loadValue () {
            var all = '';
            var self = this;
            forEach(this.$components, function (component) {
                var value = component.$value + ', ';
                all += value;
                if(component.$required) {
                    self.$value += value;
                }
            });
            if(!this.$value) {
                this.$value = all;
            }
            this.$value = this.$value.slice(0, -2);
        };

        /**
         *
         * @param components
         * @returns {ApyResourceComponent}
         */
        ApyResourceComponent.prototype.loadObjectid = function loadObjectid (components) {
            var all = '';
            var self = this;
            components = components || {};
            forEach(Object.assign(components), function (v, k) {
                if(self.continue(k)) {
                    self[k] = v;
                    delete components[k];
                }
            });
            this.load(components);
            return this;
        };

        /**
         * ApyFieldComponent
         *
         * @param name
         * @param type
         * @param value
         * @param options
         * @param $states
         * @constructor
         */
        var ApyFieldComponent = function ApyFieldComponent (name, type, value, options=null, $states=null) {
            this.$states = $states;
            options = options || {};
            this.$value = this.typeWrapper(value);
            this.$minlength = options.minlength;
            this.$maxlength = options.maxlength;
            this.$unique = options.unique || false;
            this.$required = options.required || false;
            this.$parent.constructor.call(this, name, type, null);
            this.$memo = this.clone(value);

            switch (type) {
                case 'list':
                    this.$helper = new Helper();
                    break;
                default :
                    break;
            }

            delete this['$components'];
        };

        ApyFieldComponent.inheritsFrom(ApyComponent);

        ApyFieldComponent.prototype.toString = function toString () {
            return "" + this.$value;
        };

        ApyFieldComponent.prototype.typeWrapper = function typeWrapper (value) {
            switch (this.$type) {
                case 'datetime':
                    return new Date(value);
                default :
                    return value;
            }
        };

        ApyFieldComponent.prototype.clone = function clone (value) {
            switch (this.$type) {
                case 'string':
                case 'integer':
                case 'datetime':
                    return this.typeWrapper(value);
                default :
                    return Object.assign(value);
            }
        };

        ApyFieldComponent.prototype.updateSelf = function updateSelf (update, commit=false) {
            this.$value = this.typeWrapper(update);
            if(commit) {
                this.$memo = this.clone(update);
            }
            return this;
        };

        ApyFieldComponent.prototype.reset = function reset () {
            this.$value = this.$memo;
        };

        ApyFieldComponent.prototype.hasUpdated = function hasUpdated () {
            var hasUpdated = false;
            switch (this.$type) {
                case 'list':
                    hasUpdated = !this.$helper.arrayEquals(this.$value, this.$memo);
                    break;
                case 'datetime':
                    hasUpdated = this.$value.getTime() !== this.$memo.getTime();
                    break;
                default :
                    hasUpdated = this.$value !== this.$memo;
                    break;
            }
            return hasUpdated;
        };

        /**
         *
         * @returns {ApyFieldComponent}
         */
        ApyFieldComponent.prototype.validate = function validate () {
            var expectedType = this.$type,
                selfType = typeof this.$value,
                error = false;

            if(this.$typesMap.hasOwnProperty(selfType)) {
                var allowedValues = this.$typesMap[selfType];
                if(allowedValues.indexOf(expectedType) > -1) {
                    selfType = expectedType;
                }
            }
            switch (expectedType) {
                case this.$types.MEDIA:
                    break;
                case this.$types.DATETIME:
                    if(!this.$value || isString(this.$value)) {
                        if(this.$value)
                            this.$value = new Date(this.$value);
                        else
                            this.$value = new Date();
                    }
                    if(!isDate(this.$value)) error = true;
                    break;
                default:
                    if(selfType !== expectedType) error = true;
                    break;
            }

            if(error) {
                var e = "Component property `" + this.$name + "` shall be of type => " +
                    expectedType + "! Got " + selfType;
                this.$logging.log(e);
                this.$logging.log(this.$value);
                //throw new Error(e);
            }
            return this;
        };

        /**
         *
         */
        ApyFieldComponent.prototype.cleanedData = function cleanedData () {
            this.validate();
            switch (this.$type) {
                case 'datetime':
                    return this.$value.toUTCString();
                default :
                    return this.$value;
            }
        };

        $window.ApyFieldComponent = ApyFieldComponent;
        $window.ApySchemasComponent = ApySchemasComponent;
        $window.ApyResourceComponent = ApyResourceComponent;
        $window.ApyCollectionComponent = ApyCollectionComponent;
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
    ApyCompositeService.prototype.createCollection = function(name, components=null) {
        return new ApyCollectionComponent(name, this.$endpoint, components);
    };

    $window.ApyCompositeService = ApyCompositeService;

})(window);
