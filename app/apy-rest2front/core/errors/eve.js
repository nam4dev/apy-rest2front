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
(function($apy) {
    /**
     * Common Eve-based backend methods
     *
     * @inner apy.errors
     *
     * @param {Object|Array} eveError A list of errors or an Eve specific Error object
     * @return {string} A title based on EveError introspection
     */
    function title(eveError) {
        var code;
        var title;
        var both;
        try {
            if ($apy.helpers.isObject(eveError) &&
                eveError.data && eveError.data._error) {
                code = eveError.data._error.code;
            }
            else {
                code = eveError.status || eveError._error.code;
            }
        }
        catch (e) {code = 'Error';}
        try {
            if ($apy.helpers.isObject(eveError) &&
                eveError.data && eveError.data._error) {
                title = eveError.data._error.message;
            }
            else {
                title = eveError.statusText || eveError._error.message;
            }
        }
        catch (e) {title = '';}

        if (code && title) {
            both = code + ': ' + title;
        }
        else if (title) {
            both = title;
        }
        else {
            both = code;
        }
        return both;
    }

    /**
     * Common Eve-based backend methods
     *
     * @inner apy.errors
     *
     * @param {Object|Array} eveError A list of errors or an Eve specific Error object
     * @returns {Array} A list of issues based on EveError introspection
     */
    function messages(eveError) {
        var messages = [];

        if (Array.isArray(eveError)) {
            messages = eveError;
        }
        if($apy.helpers.isObject(eveError) && eveError._error) {
            messages.push(eveError._error.message);
        }
        if (eveError.data && eveError.data.error_description) {
            messages.push(eveError.data.error_description);
        }
        if (eveError.data && eveError.data._error && eveError.data._error.message) {
            messages.push(eveError.data._error.message);
        }
        if ($apy.helpers.isObject(eveError) && eveError.data && eveError.data._issues) {
            messages = eveError.data._issues;
        }

        if (Array.isArray(messages) && !messages.length) {
            messages.push('No details found!');
        }
        return messages;
    }

    /**
     * Normalize an Error (HTTP)
     *
     * @param error The error instance
     * @return {{}} A normalized Error
     */
    function normalizeError(error) {
        var normalizedError;
        if(error.responseJSON) {
            normalizedError = error.responseJSON;
        }
        else if(error.responseText) {
            try{
                normalizedError = JSON.parse(error.responseText);
            } catch(e) {
                console.debug(e);
            }
        }
        else {
            normalizedError = error;
        }
        try {
            normalizedError.status = error.status;
            normalizedError.statusText = error.statusText;
        } catch(e) {
            console.debug(e);
        }
        return normalizedError;
    }

    /**
     * Define a specific Eve Error base class
     *
     * @class apy.errors.EveError
     *
     * @param {Object|Array} eveError Any Eve Error
     */
    function EveError(eveError) {
        var error = Error.call(this, title(eveError));
        this.name = 'EveError';
        this.title = this.message = error.message;
        this.stack = error.stack;
        this.messages = messages(eveError);
    }

    EveError.prototype = Object.create(Error.prototype);
    EveError.prototype.constructor = EveError;
    $apy.errors.EveError = EveError;

    /**
     * Define a specific Eve Error class to handle HTTP Error
     *
     * @class apy.errors.EveHTTPError
     *
     * @param {Object} eveError Any Eve HTTP Error
     */
    function EveHTTPError(eveError) {
        var normalizedError = normalizeError(eveError);
        var error = Error.call(this, title(normalizedError));
        this.name = 'EveHTTPError';
        this.title = this.message = error.message;
        this.stack = error.stack;
        this.messages = messages(normalizedError);
    }

    EveHTTPError.prototype = Object.create(Error.prototype);
    EveHTTPError.prototype.constructor = EveHTTPError;
    $apy.errors.EveHTTPError = EveHTTPError;
})(apy);
