/**
 *
 */
(function ($window, angular) { // 'use strict';

    var BrowserSupportedMimeTypes, DownloadAttributeSupport, BlobBuilder, URL;

    String.prototype.replaceAll = function(target, replacement) {
        return this.split(target).join(replacement);
    };

    String.prototype.capitalize = function() {
        var lower = this.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    /**
     *
     */
    var initVars = function initVars () {

        BrowserSupportedMimeTypes = {
            "image/jpeg": true,
            "image/png": true,
            "image/gif": true,
            "image/svg+xml": true,
            "image/bmp": true,
            "image/x-windows-bmp": true,
            "image/webp": true,
            "audio/wav": true,
            "audio/mpeg": true,
            "audio/webm": true,
            "audio/ogg": true,
            "video/mpeg": true,
            "video/webm": true,
            "video/ogg": true,
            "text/plain": true,
            "text/html": true,
            "text/xml": true,
            "application/xhtml+xml": true,
            "application/json": true
        };

        DownloadAttributeSupport = 'download' in document.createElement('a');
        BlobBuilder = $window.BlobBuilder || $window.WebKitBlobBuilder || $window.MozBlobBuilder || $window.MSBlobBuilder;
        URL = $window.URL || $window.webkitURL || $window.mozURL || $window.msURL;
        navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
        $window.saveAs = $window.saveAs || $window.webkitSaveAs || $window.mozSaveAs || $window.msSaveAs;

    };

    /**
     *
     * @param data
     * @param filename
     * @param mimetype
     */
    var blobPrinter = function (data, filename, mimetype) {
        var showSave;
        if (BlobBuilder && navigator.saveBlob)
        {
            showSave = function (data, name, mimetype) {
                var builder = new BlobBuilder();
                builder.append(data);
                var blob = builder.getBlob(mimetype||"application/octet-stream");
                if (!name) name = "Download.bin";
                if (window.saveAs) {
                    window.saveAs(blob, name);
                }
                else {
                    navigator.saveBlob(blob, name);
                }
            };
        }
        else if (BlobBuilder && URL)
        {
            showSave = function (data, name, mimetype) {
                var blob, url, builder = new BlobBuilder();
                builder.append(data);
                if (!mimetype) mimetype = "application/octet-stream";
                if (DownloadAttributeSupport) {
                    blob = builder.getBlob(mimetype);
                    url = URL.createObjectURL(blob);
                    var link = document.createElement("a");
                    link.setAttribute("href",url);
                    link.setAttribute("download",name||"Download.bin");
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    link.dispatchEvent(event);
                }
                else {
                    if (BrowserSupportedMimeTypes[mimetype.split(";")[0]] === true) {
                        mimetype = "application/octet-stream";
                    }

                    blob = builder.getBlob(mimetype);
                    url = URL.createObjectURL(blob);
                    window.open(url, '_blank', '');
                }
            };

            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 250);
        }
        else if (!/\bMSIE\b/.test(navigator.userAgent))
        {
            showSave = function (data, name, mimetype) {
                if (!mimetype) mimetype = "application/octet-stream";
                // Again I need to filter the mime type so a download is forced.
                if (BrowserSupportedMimeTypes[mimetype.split(";")[0]] === true) {
                    mimetype = "application/octet-stream";
                }
                window.open("data:"+mimetype+","+encodeURIComponent(data), '_blank', '');
            };
        }


        if (!showSave)
        {
            alert("Your browser does not support any method of saving JavaScript gnerated data to files.");
            return;
        }

        showSave(data, filename, mimetype);
    };

    /**
     *  The NgEveEmbeddedFields Class provides an Object which will compute
     *  whether your schema contains embedded fields or not and
     *  some calculations of course :)
     *
     * @param controller
     * @param schemas
     * @param schema
     * @param embeddedKey
     * @constructor
     */
    var ApySchema = function (controller, schemas, schema, embeddedKey) {

        var self = this;

        self.init = function () {
            self.$embeddedCollections = {};

            self._schema = schema;
            self._embeddedURI = null;
            self._embeddedData = null;
            self._hasEmbeddedData = false;
            self._embeddedKey = embeddedKey ? embeddedKey : 'embedded';
            self._extract();

            return self;
        };

        self.embeddedURI = function () {
            if(self._embeddedURI === null && !self._hasEmbeddedData)
            {
                self._embeddedURI = '';
            }
            if(self._embeddedURI === null)
            {
                var embedded = {};
                angular.forEach(self._embeddedData, function (el, name) {
                    embedded[name] = 1;
                });
                self._embeddedURI =  self._embeddedKey + '=' + JSON.stringify(embedded);
            }
            return self._embeddedURI;
        };

        self._extract = function () {
            if(self._embeddedData === null)
            {
                self._embeddedData = {};
                angular.forEach(self._schema, function (validator, fieldName) {
                    switch (validator.type)
                    {
                        case "objectid":
                            if (fieldName !== '_id')
                            {
                                var schemaName = validator.data_relation.resource,
                                    isEmbedded = validator.data_relation.embeddable;
                                if (schemaName && !self.$embeddedCollections.hasOwnProperty(schemaName))
                                {
                                    if(isEmbedded)
                                    {
                                        self._hasEmbeddedData = true;
                                        self._embeddedData[fieldName] = angular.copy(validator.data_relation);
                                        //$log.log('totu -> ' + schemaName);
                                        //$log.log(schemas);

                                        self.$embeddedCollections[schemaName] = controller.createCollection(schemas, schemaName, isEmbedded);

                                        //$log.log('self.$embeddedCollections');
                                        //$log.log(self.$embeddedCollections);
                                    }
                                }
                            }
                            break;
                        default :
                            break;
                    }
                });
            }
            return self;
        };

        // `onload` pre-computing
        self.init();
    };

    var ApyMediaFile = function (data, rootPath, logging=null) {
        var self = this,
            isBase64 = null,
            $log = logging || console || {
                    log: function (message) {
                        return alert(message);
                    }
                },
            defaults = {
                SIZE: 0,
                PATH: "#",
                NAME: "data.bin",
                TYPE: "application/octet-stream"
            };

        self.blob = null;
        self.path = null;
        self.fileObj = null;
        self.isImage = false;
        self.isBase64 = false;
        self.name = defaults.NAME;
        self.type = defaults.TYPE;
        self.size = defaults.SIZE;
        self.webkitRelativePath = "";
        self.lastModifiedDate = new Date();
        self.lastModified = new Date().getTime();

        self.isBase64String = function(s, opts) {
            if(isBase64 === null)
            {
                var regex = /^[a-zA-Z0-9+/]+={0,2}$/;
                isBase64 = (opts.exact ? new RegExp('(?:^' + regex + '$)') :
                    new RegExp('(?:^|\\s)' + regex, 'g')).test(s);
            }
            return isBase64;
        };

        self.setBLOB = function (blob) {
            if(!self.blob && blob)
            {
                var array = new Uint8Array(blob.length);
                for( var i = 0; i < blob.length; i++ )
                {
                    array[i] = blob.charCodeAt(i)
                }
                if(!self.blob)
                {
                    self.blob = URL.createObjectURL(new Blob([array]));
                }
            }
            return self.blob;
        };

        self.formatPath = function (root, path) {
            if(!path) return '#';
            if(path.indexOf('/') !== -1)
            {
                path = path.substring(1);
            }
            return root ? root + path : path;
        };

        self.setFile = function (fileObj) {
            self.init(fileObj);
            self.fileObj = fileObj;
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                self.path = e.target.result;
            };
            try {
                fileReader.readAsDataURL(fileObj);
            } catch(e) {
                $log.log('[fileReader.readAsDataURL] Error => ' + e)
            }

        };

        self.init = function (d) {
            if(self.isBase64String(d, { exact: true }))
            {
                self.setBLOB(window.atob(d));
                self.isBase64 = true;
            }
            if(angular.isObject(d))
            {
                self.name = d.name || defaults.NAME;
                self.size = d.size || defaults.SIZE;
                self.type = d.content_type || d.type || defaults.TYPE;
                self.lastModified = d.lastModified || self.lastModified;
                self.lastModifiedDate = d.lastModifiedDate || self.lastModifiedDate;
                self.webkitRelativePath = d.webkitRelativePath || self.webkitRelativePath;
                self.path = !self.isBase64 ? self.formatPath(rootPath, d.file) : defaults.PATH;
            }
            else
            {
                self.path = !self.isBase64 ? self.formatPath(rootPath, d) : defaults.PATH;
            }
            self.isImage = self.type.indexOf('image') > -1;
        };
        self.init(data);
    };

    /**
     *
     * @param collection
     * @param name
     * @param value
     * @param validator
     * @constructor
     */
    var ApyField = function (collection, name, value, validator) {
        var self = this,
            $log = collection.$log;

        self.id = null;
        self.error = "";
        self.name = name;
        self.classes = [];
        self.media = null;
        self.validator = validator;
        self.type = validator.type;
        self.value = value || collection.valueFromType(validator.type);

        self.isHidden = function () {
            return self.name.indexOf('_') === 0 || self.name.indexOf('$') === 0;
        };

        self.isEmbedded = function () {
            return self.name.indexOf('_') !== 0 && self.type === 'objectid';
        };

        self.isValid = function () {
            return self.type === typeof self.value;
        };

        self.validate = function () {
            if(!self.isValid()) {
                return 'Value ' + typeof self.value + ' is not of type: ' + self.type;
            }
        };

        //$log.debug('ARGS => ');
        //$log.debug(name);
        //$log.debug(value);
        //$log.debug(validator);

        //TODO: To be refactored
        // Media Type
        if(self.type === 'media') {
            self.media = new ApyMediaFile(self.value, collection.$endpoint);
            // Resetting for avoiding to send blob or uri on Update
            self.value = "";
            self.setFile = function (file) {
                self.media.setFile(file);
            };
        }

    };

    /**
     *
     * @param created
     * @param resource
     * @param collection
     * @param iAmEmbedded
     * @constructor
     */
    var ApyResource = function (collection, resource, iAmEmbedded, created) {
        var self = this,
            hasLinks,
            $log = collection.$log,
            fields = resource || {};

        self.upload = function (file) {
            return collection.controller.upload(self, file);
        };

        self.files = function() {
            var files = [];
            angular.forEach(self.$schema, function (_, name) {
                var item = self[name];
                if(item instanceof ApyField) {
                    if(item.media && item.media.fileObj) files.push(item.media.fileObj);
                }
                else if(item instanceof ApyResource) {
                    files.extend(item.files())
                }
            });
            $log.log('ALL GATHERED FILES => ');
            $log.log(files);
            return files;
        };

        self.upmit = function() {
            return collection.controller.upmit(self, self.files());
        };

        self.submit = function() {
            return collection.controller.submit(self, self.files());
        };

        self.hasLinks = function (r) {
            return r._links && r._links.self;
        };

        self._load = function () {
            var all = [], mandatory = [], fieldInstance;

            angular.forEach(self.$schema, function (validator, fieldName) {
                switch (validator.type) {

                    case "objectid":
                        if(fieldName !== '_id') {
                            var schemaName = validator.data_relation.resource;
                            self[fieldName] = collection.$embeddedCollections[schemaName]
                                .createResource(fields[fieldName], created);
                        }
                        else {
                            self[fieldName] = fields[fieldName];
                        }
                        break;
                    default :
                        self[fieldName] = fieldInstance = new ApyField(collection, fieldName,
                            fields[fieldName], validator);

                        if (!created && iAmEmbedded) {
                            if(!fieldInstance.isHidden() &&
                                !fieldInstance.isBase64 &&
                                !validator.data_relation &&
                                fieldInstance.value &&
                                !angular.isObject(fieldInstance.value)) {

                                if(validator.required) {
                                    mandatory.push(fieldInstance.value)
                                }
                                else {
                                    all.push(fieldInstance.value);
                                }
                            }
                        }
                        break;
                }
            });
            if (!self.$created && iAmEmbedded) {
                self.$shortValue = mandatory.length > 0 ? mandatory.join() : all.join();
            }
        };

        self.load = function () {
            hasLinks = self.hasLinks(resource);

            self._id = resource._id;
            self._etag = resource._etag;
            self._created = resource._created;
            self._updated = resource._updated;
            self._deleted = resource._deleted;

            self.$created = created;
            self.$log = collection.$log;
            self.$name = collection.schemaName;
            self.$schema = collection.schemas[self.$name].data;
            self.$endpoint = collection.$endpoint;
            self.$link = hasLinks ? resource._links.self.href : '';
            self.$title = hasLinks ? resource._links.self.title : '';

            self._load();
        };

        self.copy = function () {
            return angular.copy(self);
        };

        self.update = function (eveResult) {
            self._id = eveResult._id;
            self._etag = eveResult._etag;
            self._created = eveResult._created;
            self._updated = eveResult._updated;
            self._deleted = eveResult._deleted;

            self.$link = eveResult._links.self.href;
            self.$title = eveResult._links.self.title;
        };

        // Public method - Clean a Resource to be Eve-compatible
        self.cleaned = function (commit) {
            var cleaned = {};
            var shallCommit = commit === undefined;
            angular.forEach(self, function (field, key) {
                if(field && !angular.isFunction(field)) {
                    if(field instanceof ApyResource) {
                        cleaned[key] = shallCommit ? field._id : field.$shortValue;
                    }
                    else if (field.isHidden && !field.isHidden() && !field.media) {
                        //$log.log("Cleaned =>", key);
                        //$log.log("Type =>", field.type);
                        if(field.type === 'datetime') {
                            //$log.log("Cleaned datetime =>");
                            //$log.log(field.value);
                            //$log.log(field.value.toLocaleString());
                            //$log.log(field);
                        }

                        cleaned[key] = field.value;
                    }
                    else if (field.isHidden && !field.isHidden() && field.media) {

                        if(field.media && field.media.fileObj) {
                            //$log.log("Cleaned =>", key);
                            //$log.log("Type =>", field.type);
                            //$log.log(field);
                            cleaned[key] = field.media.fileObj;
                        }

                    }
                }
            });
            return cleaned;
        };

        self.load();
    };


    /**
     *
     * @param schemas
     * @param embedded
     * @param schemaName
     * @param controller
     * @constructor
     */
    var ApyCollection = function (controller, schemas, schemaName, embedded) {

        var self = this,
            $log = controller.$log;
        /**
         *
         */
        self.initialize = function () {

            initVars();

            self.wrapped = [];
            self.schemas = schemas;
            self.embedded = embedded;
            self.schemaFieldCount = 0;
            self.$log = controller.$log;
            self.$endpoint = controller.endpoint;
            self.controller = controller;
            self.schemaName = schemaName;
            self.states = controller.states;
            self.schema = (schemas[schemaName].data
                ? schemas[schemaName].data
                : schemas[schemaName]);
            self.schemaInstance = new ApySchema(controller, schemas, self.schema);

            self.$embeddedCollections = self.schemaInstance.$embeddedCollections;

            self.createInitial = function (schema) {
                return self.sanitize(schema || self.schema, self.valueFromType);
            };
            self._computeSchemaFieldCount();
        };

        /**
         * @returns {Promise}
         */
        self.fetch = function () {
            var embeddedURI = self.schemaInstance.embeddedURI(),
                uri = schemaName;

            if(embeddedURI && self.embedded) {
                uri += '?' + embeddedURI;
            }
            return new Promise(function (resolve, reject) {
                return self.controller.fetch(uri)
                    .then(function (response) {
                        return resolve(self.wraps(response.data._items || []));
                    })
                    .catch(function (error) {
                        return reject(error);
                    });
            });
        };

        /**
         *
         */
        self._computeSchemaFieldCount = function () {
            self.schemaFieldCount = 0;
            angular.forEach(self.schema, function () {
                self.schemaFieldCount++;
            });
        };

        /**
         *
         * @param value
         * @returns {*}
         */
        ApyCollection.prototype.valueFromType = function (value) {
            if(!value) return value;

            switch (value.type) {
                case 'list':
                    return [];
                case 'dict':
                    return {};
                case 'integer':
                    return 0;
                case 'datetime':
                    return new Date();
                default :
                    return '';
            }
        };

        /**
         * Public method - Sanitize an Eve Resource to be RESTful
         *
         * @param r
         * @param valueInterceptor
         * @returns {{}}
         */
        ApyCollection.prototype.sanitize = function (r, valueInterceptor) {
            var sanitized = {};
            angular.forEach(r, function (value, key) {
                if (key.indexOf('_') !== 0) {
                    if(value.type === 'dict') {
                        sanitized[key] = self.sanitize(value.schema, valueInterceptor);
                    }
                    else {
                        sanitized[key] = valueInterceptor === undefined ? value : valueInterceptor(value);
                    }
                }
            });
            return sanitized;
        };

        /**
         *
         * @returns {ApyResource}
         */
        self.createResource = function (source, created) {
            var result,
                initial = self.createInitial();
            if(source) {
                result = self.wrap(angular.merge(initial, source), created);
            }
            else {
                result = self.wrap(initial, created);
            }
            self.wrapped.push(result);
            return result;
        };

        /**
         *
         * @param error
         * @returns {*|{_issues: {origError: *, message: string}}}
         */
        self.errorHandler = function (error) {
            $log.log('TA MERE => ');
            $log.log(error);
            return error;
        };

        /**
         *
         * @param resource
         * @returns {Promise}
         */
        self.create = function (resource) {
            return new Promise(function (resolve, reject) {
                return self.controller.create(resource).success(function (result) {
                    resource.update(result);
                    return resolve(result);
                }).error(function (error) {
                    return reject(self.errorHandler(error));
                });
            });
        };

        /**
         *
         * @param resource
         * @returns {Promise}
         */
        self.update = function (resource) {
            return new Promise(function (resolve, reject) {
                return self.controller.update(resource).success(function (result) {
                    resource.update(result);
                    return resolve(result);
                }).error(function (error) {
                    return reject(self.errorHandler(error));
                });
            });
        };

        /**
         *
         * @param resource
         */
        self.removeResource = function (resource) {
            angular.forEach(self.wrapped, function (it, index) {
                if (it._id == resource._id) {
                    self.wrapped.splice(index, 1);
                }
            });
        };

        /**
         *
         * @param resource
         * @returns {Promise}
         */
        self.delete = function (resource) {
            return new Promise(function (resolve, reject) {
                return self.controller.delete(resource).success(function (result) {
                    self.removeResource(resource);
                    return resolve(result);
                }).error(function (error) {
                    return reject(self.errorHandler(error));
                });
            });
        };

        self.fetchEmbeddedResources = function (resourceName) {
            return self.controller.createCollection(schemas, resourceName, true).fetch();
        };

        /**
         *
         * @param resource
         * @param created
         * @returns {ApyResource}
         */
        self.wrap = function (resource, created) {
            return new ApyResource(self, resource, self.embedded, created);
        };

        /**
         *
         * @param resources
         * @param created
         * @returns {Array}
         */
        self.wraps = function (resources, created) {
            angular.forEach(resources, function (resource) {
                self.createResource(resource, created);
            });
            return self.wrapped;
        };

        self.initialize();

    };

    // Registering Classes into window component
    $window.ApyField = ApyField;
    $window.ApyResource = ApyResource;
    $window.ApyCollection = ApyCollection;
    $window.blobPrinter = blobPrinter;

})(window, window.angular);


