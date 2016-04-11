(function ($window, angular) {'use strict';
    /**
     * Keep States and handle them
     */
    var ApyStack = function (states, initialState, noStateAllowed) {

        var self = this;

        if(noStateAllowed === undefined) noStateAllowed = false;

        self._load = function () {
            angular.forEach(self.states, function (state) {
                self['$$' + state] = state;
            });
            return self;
        };

        self.init = function () {
            self.states = states || [];
            self.initialState = initialState;
            self.innerStates = [initialState];
            return self._load();
        };

        self.stack = function (state, noCheck) {
            if(!noCheck) noCheck = false;

            if(!noCheck && !state in self.states) {
                throw new Error('Unknown state: ' + state +
                    ' - Available are: ' + self.states.join());
            }
            self.innerStates.push(state);
            return self;
        };

        self.getCurrent = function () {
            return self.innerStates.slice(-1)[0];
        };

        self.getPrevious = function () {
            return self.innerStates.slice(-2)[0];
        };

        self.unstack = function () {
            var popped = self.innerStates.pop();
            if (noStateAllowed === false  && popped === undefined) {
                popped = self.initialState;
                self.innerStates.push(popped);
            }
            return popped;
        }
    };

    var service = null;


    /**
     *  The ApyService provides an Object which will load,
     *  each of your Eve's REST API schema endpoint(s) and gives you:
     *
     *  * A full CRUD MMI for each (Tables, Lists, Forms, ...)
     *  * A configurable endpoint URI
     *  * A configurable CSS theme (default: Bootstrap 3)
     */
    var ApyService = function ($log, $http, Upload, config) {

        if(!service) {
            service = new ApyCompositeService($log, $http, Upload, config);
            //service.playground();
        }

        // Privileged variables
        var self = this,
            $syncHttp = new XMLHttpRequest(),
            states = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'SELECTION', 'NESTED'];

        self.$log = $log;
        self.conf = config;
        //self.collections = {};
        self.theme = undefined;
        self.schemas = undefined;
        self.endpoint = undefined;
        self.schemasEndpoint = undefined;

        // File Upload field Callbacks

        // upload on file select or drop
        self.upload = function (resource, file, method) {
            var cleaned = resource.cleaned(),
                endpoint,
                headers = {
                    'Content-Type': 'application/json'
                };

            cleaned['media'] = file;
            switch (method) {
                case 'POST':
                    endpoint = self.endpoint + resource.$name;
                    break;
                case 'PATCH':
                case 'DELETE':
                    endpoint = self.endpoint + resource.$link;
                    headers['If-Match'] = resource._etag;
                    break;
            }

            return self.$Upload.upload({
                url: endpoint,
                method: method,
                data: cleaned,
                headers: headers
            }).then(function (resp) {
                $log.log('Response: ' + resp.data);
                //$log.log(resp);
                $log.log('Success ' + resp.config.data.media.name + 'uploaded. ');
            }, function (resp) {
                $log.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //$log.log(evt);
                $log.log('progress: ' + progressPercentage + '% ' + evt.config.data.media.name);
            });
        };
        // for multiple files:
        self.uploadFiles = function (resource, files, method) {
            var results = [];
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    results.push(self.upload(resource, files[i], method));
                }
                //TODO: or send them all together for HTML5 browsers:
                //results.push(self.upload(resource, files));
            }
            //$log.log('results: ');
            //$log.log(results);
            return results;
        };

        // upload later on form submit or something similar
        self.upmit = function(resource, files) {
            var results = [];
            //$log.log('[SUBMIT] Files => ');
            //$log.log(files);
            if (files) {
                results = self.uploadFiles(resource, files, 'PATCH');
            }
            return results;
        };

        // upload later on form submit or something similar
        self.submit = function(resource, files) {
            var results = [];
            //$log.log('[SUBMIT] Files => ');
            //$log.log(files);
            if (files) {
                results = self.uploadFiles(resource, files, 'POST');
            }
            return results;
        };

        // Loads Schemas **synchronously** (onload)
        self._load = function () {
            $syncHttp.open('GET', self.schemasEndpoint, false);
            $syncHttp.send(null);
            self.schemas = JSON.parse($syncHttp.response);

            $log.log('SCHEMAS =>');
            $log.log(self.schemas);

            return self;
        };

        /**
         *
         * @param states
         * @param initialState
         * @param noStateAllowed
         */
        self.createStack = function (states, initialState, noStateAllowed) {
            return new ApyStack(states, initialState, noStateAllowed).init();
        };
        // READ as initial state
        var initialState = states[1];
        self.states = self.createStack(states, initialState);

        self.setDependencies = function() {
            for(var i = 0; i < arguments.length; ++i) {
                //i is always valid index in the arguments object
                self['$' + arguments[i].name] = arguments[i].value;
            }
        };

        self.initEndpoints = function(endpoint, schemaName) {
            self.schemasEndpoint = endpoint + schemaName;
            self.endpoint = endpoint;
        };

        // Entry point
        // Returns:
        //        - A Promise object to dynamically set
        //          your $scope instance accordingly
        self.init = function(endpoint, schemaName, th) {
            self.theme = th;
            self.initEndpoints(endpoint, schemaName);
            return self._load().formatSchemas2Array(self.schemas, self.conf.excludedEndpointByNames || []);
        };

        // Fetch Resource(s) based on given parameters and
        // concatenated endpoint & endpointName value
        self.fetch = function (resource) {
            return $http({
                url: self.endpoint + resource,
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'GET',
                params: {}
            });
        };

        // Create a Resource based on given parameters and
        // concatenated endpoint & endpointName value
        self.create = function (resource) {
            if(resource.submit().length > 0) return;
            return $http({
                url: resource.$endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                data: resource.cleaned()
            });
        };

        // Update a Resource based on given parameters and
        // endpoint value
        self.update = function (resource) {
            if(resource.upmit().length > 0) return;
            return $http({
                url: self.endpoint + resource.$link,
                headers: {
                    'If-Match': resource._etag,
                    'Content-Type': 'application/json'
                },
                method: 'PATCH',
                data: resource.cleaned()
            });
        };

        // Delete a Resource based on given parameters and
        // endpoint value
        self.delete = function (resource) {
            return $http({
                url: self.endpoint + resource.$link,
                headers: {
                    'If-Match': resource._etag
                },
                method: 'DELETE'
            });
        };

        /**
         *
         */
        self.updateTransition = function () {
            self.states.stack(self.states.$$UPDATE);
        };

        /**
         *
         */
        self.createTransition = function () {
            self.states.stack(self.states.$$CREATE);
        };

        /**
         *
         */
        self.deleteTransition = function () {
            self.states.stack(self.states.$$DELETE);
        };

        /**
         * Public method - Create a ApyCollection instance
         *
         * @param schemas
         * @param schemaName
         * @param embedded
         * @returns {*|ApyCollection}
         */
        self.createCollection = function (schemas, schemaName, embedded) {
            return new ApyCollection(self, schemas, schemaName, embedded);
        };

        /**
         *
         * @param field
         * @param validator
         * @param resource
         * @param isInitial
         * @param $scope
         */
        self.onNestedResourceTransition = function (field, validator, resource, isInitial, $scope) {
            var collection = $scope.collection;
            self.states.stack(self.states.$$NESTED);
            $scope.memoNestedField.stack(field);
            $scope.nestedSchema = validator.schema;
            var initial = collection.createInitial(validator.schema),
                value = isInitial ? resource : resource[field];

            if (value instanceof ApyField) {
                value = value.value;
            }
            $scope.nestedSubItem = value;

            $scope.memoNestedFields[field] = {
                nestedSubItem: value,
                initialItem: initial,
                initialSchema: validator.schema
            };
            $scope.open();
        };

        /**
         *
         * @param field
         * @param validator
         * @param $scope
         */
        self.onEmbeddedResourceTransition = function (field, validator, $scope) {
            self.states.stack(self.states.$$SELECTION);
            $scope.collection.fetchEmbeddedResources(validator.data_relation.resource)
                .then(function (items) {
                    $scope.embeddedColItems = items;
                    $scope.fieldName = field;
                    $scope.open();
                })
                .catch(function (error) {
                    $scope.errors.push(error);
                    $scope.open();
                });
        };

        /**
         *
         * @param action
         * @param message
         * @param $scope
         */
        self.onStateTransition = function (action, message, $scope) {
            var current = self.states.getCurrent(),
                collection = $scope.collection;

            if(!current) return;

            switch (current) {
                case self.states.$$NESTED:
                    $log.log('Popped nested field => ' + $scope.memoNestedField.unstack());
                    var currentField = $scope.memoNestedField.getCurrent(),
                        memo = $scope.memoNestedFields[currentField];

                    if(memo) {
                        $scope.nestedSchema = memo.initialSchema;
                        $scope.nestedSubItem = memo.nestedSubItem;
                        switch (action) {
                            case 'ok':
                            case 'cancel':
                                break;
                        }
                    }
                    break;

                case self.states.$$SELECTION:
                    switch (action) {
                        case 'ok':
                            var resource = message.resource || {},
                                field = message.field,
                                selected = message.selected;

                            if ($scope.originalFieldsData === undefined) {
                                $scope.originalFieldsData = {};
                            }
                            if(!$scope.originalFieldsData.hasOwnProperty(field) && resource[field]) {
                                $scope.originalFieldsData[field] = {
                                    resource: resource[field],
                                    original: angular.copy(resource[field])
                                };
                            }
                            if(selected !== undefined) {
                                angular.merge(resource[field], selected);
                            }
                            $scope.embeddedColItems = undefined;
                            break;
                        case 'cancel':
                            collection.removeResource($scope.resource);
                            var fieldsData = $scope.originalFieldsData;
                            if(fieldsData && Object.keys(fieldsData).length > 0) {
                                angular.forEach(fieldsData, function (resourceData) {
                                    if (resourceData && resourceData.original) {
                                        angular.merge(resourceData.resource, resourceData.original);
                                    }
                                });
                            }
                            $scope.originalFieldsData = {};
                            $scope.embeddedColItems = undefined;
                            break;
                    }
                    break;

                case self.states.$$UPDATE:
                    switch (action) {
                        case 'ok':
                            break;
                        case 'cancel':
                            $scope.resource = undefined;
                            break;
                    }
                    break;

                case self.states.$$CREATE:
                    switch (action) {
                        case 'ok':
                            break;
                        case 'cancel':
                            collection.removeResource($scope.resource);
                            $scope.resource = undefined;
                            break;
                    }
                    break;

                case self.states.$$DELETE:
                    switch (action) {
                        case 'ok':
                            break;
                        case 'cancel':
                            break;
                    }
                    break;
                default :
                    $log.error('NOk boom');
                    break;
            }
            self.states.unstack();
        };

        // Public method - format received Schema(s)
        // into Angular friendly Object instead of Array
        ApyService.prototype.formatSchemas2Object = function (data) {
            var schemas = {};
            angular.forEach(data, function (el) {
                var name = el['name'];
                el['endpoint'] = self.endpoint + name;
                schemas[name] = el;
            });
            return schemas;
        };

        // Public method - format received Schema(s)
        // into Angular Array instead of Object
        ApyService.prototype.formatSchemas2Array = function (data, excludedEndpointByNames) {
            var schemas = [];
            excludedEndpointByNames = excludedEndpointByNames || [];
            angular.forEach(data, function (el, name) {
                //$log.log('Data => ' + name);
                //$log.log('Included => ');
                //$log.log(excludedEndpointByNames);
                //$log.log(excludedEndpointByNames.indexOf(name) === -1);
                //$log.log(el);
                if(excludedEndpointByNames.indexOf(name) === -1) {
                    schemas.push({
                        endpoint: self.endpoint + name,
                        name: name,
                        humanName: name.replaceAll('_', ' '),
                        data: el
                    });
                }
            });
            return schemas;
        };
    };


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

        /**
         *
         * @param array
         * @param thing
         * @returns {boolean}
         */
        Helper.prototype.arrayContains = function (array, thing) {
            // if the other array is a falsy value, return false
            if (!array)
                return false;
            //start by assuming the array doesn't contain the thing
            var result = false;
            for (var i = 0, l=array.length; i < l; i++)
            {
                //if anything in the array is the thing then change our mind from before
                if (array[i] instanceof Array)
                {if (array[i].equals(thing))
                    result = true;}
                else
                if (array[i]===thing)
                    result = true;
            }
            //return the decision we left in the variable, result
            return result;
        };

        /**
         *
         * @param array
         * @param thing
         * @returns {number}
         */
        Helper.prototype.arrayIndexOf = function (array, thing) {
            // if the other array is a falsy value, return -1
            if (!array)
                return -1;
            //start by assuming the array doesn't contain the thing
            var result = -1;
            for (var i = 0, l=array.length; i < l; i++)
            {
                //if anything in the array is the thing then change our mind from before
                if (array[i] instanceof Array)
                    if (array[i].equals(thing))
                        result = i;
                    else
                    if (array[i]===thing)
                        result = i;
            }
            //return the decision we left in the variable, result
            return result;
        };

        /**
         * @ngdoc function
         * @name angular.isUndefined
         * @module ng
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
         * @ngdoc function
         * @name angular.isDefined
         * @module ng
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
         * @ngdoc function
         * @name angular.isObject
         * @module ng
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
         * @ngdoc function
         * @name angular.isString
         * @module ng
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
         * @ngdoc function
         * @name angular.isNumber
         * @module ng
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
         * @ngdoc function
         * @name angular.isDate
         * @module ng
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
         * @ngdoc function
         * @name angular.isArray
         * @module ng
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
         * @ngdoc function
         * @name angular.isFunction
         * @module ng
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

        var service             = this,
            getPrototypeOf      = Object.getPrototypeOf,
            toString            = Object.prototype.toString,
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
            angular.forEach(this.$states, function (value) {
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
                if(!this.hasOwnProperty('logging'))
                {
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
            this.$schema = schema;
            this.$embeddeURI = '';
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
            angular.forEach(this.$schema, function (validator, fieldName) {
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
                this.$embeddeURI = 'embedded=' + JSON.stringify(embedded);
            }
            delete this.$schema;
            return this;
        };

        /**
         * ApyCollectionComponent
         *
         * @param name
         * @param schema
         * @param endpoint
         * @param components
         * @constructor
         */
        var ApyCollectionComponent = function ApyCollectionComponent (name, endpoint, schema, components=null) {
            this.$schemaBase = schema;
            this.$endpointBase = endpoint;
            this.$schema = new ApySchemaComponent(schema);
            this.$endpoint = endpoint + name + '?' + this.$schema.$embeddeURI;
            this.$parent.constructor.call(this, name, "collection", components);
        };

        ApyCollectionComponent.inheritsFrom(ApyComponent);

        ApyCollectionComponent.prototype.createResource = function createResource (resource) {
            var component = new ApyResourceComponent(this.$name, this.$schema);
            component.$endpointBase = this.$endpointBase;
            this.prepend(component);
            return component.load(resource || this.createResourceDataFromSchema());
        };

        ApyCollectionComponent.prototype.removeResource = function remove (resource) {
            return this.$components.splice(this.$components.indexOf(resource), 1);
        };



        ApyCollectionComponent.prototype.valueFromType = function valueFromType (type) {
            switch (type) {
                case "list":
                    return [];
                case "media":
                    return {};
                case 'string':
                    return "";
                case "integer":
                    return -1;
                case "objectid":
                    return "";
                case "datetime":
                    return new Date();
                default :
                    return null;
            }
        };

        ApyComponent.prototype.newDataFromSchema = function newDataFromSchema (schema=null) {
            var val;
            switch (schema.type) {
                case "list":
                    val = [];
                    break;
                case "dict":
                    val = this.newDataFromSchema(schema.schema);
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
                    if (key.startsWith('_')) {
                        val = "";
                    }
                    else {
                        val = this.newDataFromSchema(service.$schemas[schema.data_relation.resource]);
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

        ApyComponent.prototype.createResourceDataFromSchema = function createResourceDataFromSchema (schema=null, keyName=null) {
            var self = this;
            var data = schema ? {} : {
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
            var finalSchema = schema || this.$schemaBase;
            //console.log("finalSchema =>", finalSchema);
            var val;

            if(keyName) {
                switch (finalSchema.type) {
                    case "list":
                        val = [];
                        break;
                    case "dict":
                        val = self.createResourceDataFromSchema(finalSchema.schema);
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
                            val = self.createResourceDataFromSchema(service.$schemas[finalSchema.data_relation.resource]);
                        }
                        break;
                    case "datetime":
                        val = new Date();
                        break;
                    default :
                        val = null;
                        break;
                }
                data = val;
                //console.log("Value =>", val, "Key =>", keyName);
            }
            else {
                angular.forEach(finalSchema, function (value, key) {
                    //console.log("Value =>", value, "Key =>", key);
                    switch (value.type) {
                        case "list":
                            val = [];
                            break;
                        case "dict":
                            val = self.createResourceDataFromSchema(value.schema);
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
                                val = self.createResourceDataFromSchema(service.$schemas[value.data_relation.resource]);
                            }
                            break;
                        case "datetime":
                            val = new Date();
                            break;
                        default :
                            val = null;
                            break;
                    }
                    data[key] = val;

                });
            }
            //console.log("Data =>", data);
            return data;
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
        ApyCollectionComponent.prototype.save = function save () {
            return this.create().update();
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
         * @constructor
         */
        var ApyResourceComponent = function ApyResourceComponent (name, schema, components=null, type="resource", $states=null) {
            this.$parent.constructor.call(this, name, type, components);
            this.$value = '';
            this.$endpointBase = null;
            this.$schema = schema;
            this.$states = $states || this.createStateHolder(states[1], states);
        };

        ApyResourceComponent.inheritsFrom(ApyComponent);

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

        ApyResourceComponent.prototype.loadResponse = function loadResponse (response) {
            var self = this;
            angular.forEach(response.data, function (v, k) {
                self[k] = v;
            });
            return this;
        };

        ApyResourceComponent.prototype.createRequest = function (method='POST') {
            var self = this;
            return new Promise(function (resolve, reject) {
                var uri = self.$endpointBase + self.$name;
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
        ApyResourceComponent.prototype.createStateHolder = function (initialState, states) {
            return new ApyStateHolder(initialState, states);
        };

        /**
         *
         * @param field
         * @returns {boolean}
         */
        ApyResourceComponent.prototype.continue = function shallContinue (field) {
            return field.startsWith && field.startsWith('_');
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
                    field.startsWith('$')) {
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
                    value = resource[field] || this.createResourceDataFromSchema(subSchema, field);
                switch(type) {
                    case this.$types.DICT:
                        fieldObj = new ApyResourceComponent(field, subSchema.schema, null, 'resource', this.$states);
                        fieldObj.load(value);
                        break;
                    //case this.$types.LIST:
                    //    fieldObj = new ApyResourceComponent(field, subSchema, resource[field]);
                    //    break;
                    //case this.$types.MEDIA:
                    //    fieldObj = new ApyResourceComponent(field, subSchema, resource[field]);
                    //    break;
                    case this.$types.OBJECTID:
                        fieldObj = new ApyResourceComponent(field,
                            service.$schemas[subSchema.data_relation.resource],
                            null, 'objectid', this.$states);
                        fieldObj.loadObjectid(value);
                        break;
                    default:
                        fieldObj = new ApyFieldComponent(field, type, value, subSchema, this.$states);
                        break;
                }
                this.add(fieldObj);
            }
            return this;
        };

        /**
         *
         * @returns {{}}
         */
        ApyResourceComponent.prototype.cleanedData = function () {
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

        /**
         *
         * @param components
         * @returns {ApyResourceComponent}
         */
        ApyResourceComponent.prototype.loadObjectid = function (components) {
            var all = '';
            var self = this;
            components = components || {};
            angular.forEach(angular.copy(components), function (v, k) {
                if(self.continue(k)) {
                    self[k] = v;
                    delete components[k];
                }
            });
            this.load(components);

            angular.forEach(this.$components, function (component) {
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
                    return angular.copy(value);
            }
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
            //this.$logging.log("this.$memo =>", this.$memo);
            //this.$logging.log("this.$value =>", this.$value);
            //this.$logging.log("hasUpdated =>", hasUpdated);
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
        $window.ApyResourceComponent = ApyResourceComponent;
        $window.ApyCollectionComponent = ApyCollectionComponent;
    };

    /**
     *
     * @param schemas
     */
    ApyCompositeService.prototype.setSchemas = function (schemas) {
        this.$schemas = schemas;
        this.$schemasAsArray = this.formatSchemas2Array(schemas, this.$config.excludedEndpointByNames);
    };

    /**
     *
     * @returns {ApyCompositeService}
     */
    ApyCompositeService.prototype.loadSchemas = function () {
        this.$syncHttp.open('GET', this.$schemasEndpoint, false);
        this.$syncHttp.send(null);
        this.$schemas = JSON.parse(this.$syncHttp.response);
        this.$schemasAsArray = this.formatSchemas2Array(this.$schemas, this.$config.excludedEndpointByNames);
        return this;
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
     * @returns {*}
     */
    ApyCompositeService.prototype.getSchemaByName = function (name) {
        return this.$schemas[name];
    };

    /**
     *
     * @param name
     * @param components
     * @returns {ApyCollectionComponent|*}
     */
    ApyCompositeService.prototype.createCollection = function(name, components=null) {
        return new ApyCollectionComponent(name, this.$endpoint, this.getSchemaByName(name), components);
    };

    /**
     * format received Schema(s)
     * into Array instead of Object
     *
     * @param data
     * @param excludedEndpointByNames
     * @returns {Array}
     */
    ApyCompositeService.prototype.formatSchemas2Array = function (data, excludedEndpointByNames) {
        var self = this;
        var schemas = [];
        excludedEndpointByNames = excludedEndpointByNames || [];
        angular.forEach(data, function (el, name) {
            schemas.push({
                data: el,
                name: name,
                route: '/' + name,
                endpoint: self.$endpoint + name,
                humanName: name.replaceAll('_', ' '),
                hidden: excludedEndpointByNames.indexOf(name) !== -1
            });
        });
        return schemas;
    };

    /**
     * Playground
     */
    ApyCompositeService.prototype.playground = function () {
        this.$log.log('Starting Play ground...');
        var self = this,
            peopleGoCollection = new ApyCollectionComponent("people_go", "http://localhost:8000/", {
                name: "person_go",
                data: {
                    lastname: {
                        minlength: 1,
                        unique: true,
                        type: "string",
                        maxlength: 15,
                        required: true
                    },
                    _id: {
                        unique: true,
                        type: "objectid"
                    },
                    role: {
                        type: "list",
                        allowed: [
                            "author",
                            "contributor",
                            "copy"
                        ]
                    },
                    location: {
                        type: "dict",
                        schema: {
                            born: {
                                type: "datetime"
                            },
                            address: {
                                type: "dict",
                                schema: {
                                    entered_date: {
                                        type: "datetime"
                                    },
                                    details: {
                                        type: "dict",
                                        schema: {
                                            city: {
                                                type: "string"
                                            },
                                            address: {
                                                type: "string"
                                            },
                                            address_complement: {
                                                type: "string"
                                            },
                                            zip_code: {
                                                type: "integer"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    firstname: {
                        minlength: 1,
                        type: "string",
                        maxlength: 10
                    }
                }
            }),
            peopleCollection = new ApyCollectionComponent("people", "http://localhost:5000/", {
                name: "person",
                data: {
                    "firstname": {"minlength": 1, "type": "string", "maxlength": 10},
                    "lastname": {"minlength": 1, "unique": true, "type": "string", "maxlength": 15, "required": true},
                    "born": {"type": "datetime"},
                    "role": {"type": "list"},
                    "location": {
                        "type": "dict",
                        schema: {
                            city: {
                                type: "string"
                            },
                            address: {
                                type: "string"
                            }
                        }

                    }
                }
            }),
            mediaJobsCollection = new ApyCollectionComponent("media_jobs", "http://localhost:5000/", {
                name: "media job",
                data: {
                    media: {
                        type: "media"
                    },
                    _id: {
                        unique: true,
                        type: "objectid"
                    },
                    description: {
                        type: "string"
                    },
                    title: {
                        type: "string"
                    }
                }
            });

        peopleCollection.fetch().then(function (response) {
            self.$log.log("peopleCollection");
            //collection.logChildren();
            self.$log.log(peopleCollection.cleanedData());
            //self.$log.log(peopleCollection);
        });

        peopleGoCollection.fetch().then(function (response) {
            self.$log.log("peopleGoCollection");
            //collection.logChildren();
            self.$log.log(peopleGoCollection.cleanedData());
            //self.$log.log(peopleGoCollection);
        });

        mediaJobsCollection.fetch().then(function (response) {
            self.$log.log("mediaJobsCollection");
            //mediaJobsCollection.logChildren();
            self.$log.log(mediaJobsCollection.cleanedData());
            //self.$log.log(mediaJobsCollection);
        });
    };

    $window.ApyService = ApyService;
    $window.ApyCompositeService = ApyCompositeService;

})(window, window.angular);
