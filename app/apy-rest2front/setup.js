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
 *  Setup
 *
 *  * Patches to unify Browsers logic
 *  * File System (BrowserFS)
 *  * Namespaces
 *
 *  """
 */
/**
 * @namespace apy
 */
(function(window) {
    'use strict';

    window.apy = {
        fs: null,
        errors: {
            eve: {}
        },
        helpers: {},
        /**
         * @namespace apy.integration
         */
        integration: {
            app: null,
            react: {},
            angular: {},
        },
        components: {
            fields: {
                geo: {}
            }
        },
        /**
         * @namespace apy.settings
         */
        settings: null,
        customSettings: null,
        /**
         * @namespace apy.constants
         */
        constants: {}
    };

    var MAX_DEPTH = 100;

    var getKeys = Object.keys;
    var isNaN = window.isNaN;

    /**
     * Walks object recursively
     *
     * @param {Object} object
     * @param {Function} cb
     * @param {*} ctx
     * @param {Boolean} mode
     * @param {Boolean} ignore
     * @param {Number} max
     * @returns {Object}
     */
    function walk(object, cb, ctx, mode, ignore, max) {
        var stack = [[], 0, getKeys(object).sort(), object];
        var cache = [];

        do {
            var node = stack.pop();
            var keys = stack.pop();
            var depth = stack.pop();
            var path = stack.pop();

            cache.push(node);

            while(keys[0]) {
                var key = keys.shift();
                var value = node[key];
                var way = path.concat(key);
                var strategy = cb.call(ctx, node, value, key, way, depth);

                if (strategy === true) {
                    continue;
                } else if (strategy === false) {
                    stack.length = 0;
                    break;
                } else {
                    if(max <= depth || !value instanceof Object) continue;

                    if (cache.indexOf(value) !== -1) {
                        if (ignore) continue;
                        throw new Error('Circular reference');
                    }

                    if (mode) {
                        stack.unshift(way, depth + 1, getKeys(value).sort(), value);
                    } else {
                        stack.push(path, depth, keys, node);
                        stack.push(way, depth + 1, getKeys(value).sort(), value);
                        break;
                    }
                }
            }
        } while(stack[0]);

        return object;
    }
    /**
     * Walks object recursively
     * @param {Object} object
     * @param {Function} callback
     * @param {*} [context]
     * @param {Number} [mode=0]
     * @param {Boolean} [ignoreCircularReferences=false]
     * @param {Number} [maxDepth=100]
     * @returns {Object}
     */
    function traverse(object, callback, context, mode, ignoreCircularReferences, maxDepth) {
        var cb = callback;
        var ctx = context;
        var _mode = mode === 1;
        var ignore = !!ignoreCircularReferences;
        var max = (
            typeof maxDepth === 'number' && !isNaN(maxDepth)
        ) ? maxDepth : MAX_DEPTH;



        return walk(object, cb, ctx, _mode, ignore, max);
    }

    // export
    Object.traverse = traverse;

}(window));

(function ($apy, window) {
    'use strict';
    $apy.constants.FILE_API_SUPPORTED = false;
    /**
     * Setting constant flag `FILE_API_SUPPORTED`
     */
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        $apy.constants.FILE_API_SUPPORTED = true;
    }
    /* istanbul ignore next */
    /**
     * Add to Object type, method
     *
     *     assign(target) (Object copy)
     *
     * @memberOf apy.helpers
     */
    var patchObject = function() {
        if (!Object.prototype.assign) {
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
        if(!Object.prototype.pop) {
            Object.defineProperty(
                Object.prototype, 'pop',
                {
                    writable: false,
                    configurable: false,
                    enumerable: false,
                    value: function (name, defaultValue) {
                        var value;
                        try {
                            value = this[name];
                            delete this[name];
                        } catch(err) {
                            value = defaultValue;
                        }
                        return value;
                    }
                }
            );
        }
    };

    /* istanbul ignore next */
    /**
     * Add to String type, methods
     *
     *     capitalize()
     *     replaceAll(target, replacement)
     *
     * @memberOf apy.helpers
     */
    var patchString = function() {
        /**
         * Replace all occurrences in a string
         *
         * @param {string} target string fragment to be replaced
         * @param {string} replacement string fragment to replace with
         *
         * @return {string} Modified string
         */
        String.prototype.replaceAll = function(target, replacement) {
            return this.split(target).join(replacement);
        };

        /**
         * Capitalize string
         *
         * @return {string}
         */
        String.prototype.capitalize = function() {
            var lower = this.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        };
    };

    var toString = Object.prototype.toString;

    /* istanbul ignore next */
    /**
     * Add to Array type, method
     *
     *     isArray
     *
     * @memberOf apy.helpers
     */
    var patchArray = function() {
        if (!Array.prototype.isArray) {
            Array.prototype.isArray = function(arg) {
                return toString.call(arg) === '[object Array]';
            };
        }
    };

    patchArray();
    patchObject();
    patchString();

})(apy, window);
