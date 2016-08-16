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
/**
 * @namespace apy.errors.eve
 */
(function ( $apy ) {

    /**
     * Common Eve-based backend methods
     *
     * @param eveError
     * @returns {string}
     * @inner
     */
    function title(eveError) {
        var code;
        var title;
        var both;
        try {
            code = eveError.status || eveError.data._error.code;
        }
        catch (e) {code = 'Error';}
        try {
            title = eveError.statusText || eveError.data._error.message;
        }
        catch (e) {title = '';}

        if(code && title) {
            both = code + ': ' + title;
        }
        else if(title) {
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
     * @param eveError
     * @returns {Array}
     * @inner
     */
    function messages(eveError) {
        var messages = [];
        if(Array.isArray(eveError)) {
            messages = eveError;
        }
        else if($apy.helpers.isObject(eveError) && eveError.data && eveError.data._issues) {
            messages = eveError.data._issues;
        }
        else {
            if(eveError.data && eveError.data.error_description) {
                messages.push(eveError.data.error_description);
            }
            if(eveError.data && eveError.data._error && eveError.data._error.message) {
                messages.push(eveError.data._error.message);
            }
        }
        if(Array.isArray(messages) && !messages.length) {
            messages.push('No details found!');
        }
        return messages;
    }

    /**
     * Define a specific Eve Error base class
     *
     * @param eveError: Any Eve Error
     * @class apy.errors.eve.EveError
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
    $apy.EveError = EveError;

    /**
     * Define a specific Eve Error class to handle HTTP Error
     *
     * @param eveError: The HTTP Error
     * @class apy.errors.eve.EveHTTPError
     */
    function EveHTTPError(eveError) {
        var error = Error.call(this, title(eveError));
        this.name = 'EveHTTPError';
        this.title = this.message = error.message;
        this.stack = error.stack;
        this.messages = messages(eveError);
    }

    EveHTTPError.prototype = Object.create(Error.prototype);
    EveHTTPError.prototype.constructor = EveHTTPError;
    $apy.EveHTTPError = EveHTTPError;

})( apy );
