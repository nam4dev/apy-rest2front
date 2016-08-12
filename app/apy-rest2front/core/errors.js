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
 *
 *  """
 *  Apy Custom Error Classes.
 *  Create a unique Error interface for all kind of Error
 *
 *  ApyError: Define a base class exposing 2 methods, `title` & `messages`
 *  ApyEveError: Define a specific Eve Error class to handle HTTP Error Response
 *
 *  """
 */


/**
 * Define a base class exposing 2 methods, `title` & `messages`
 *
 * @param message
 * @constructor
 */
function ApyError(message) {
    this.title = 'ApyError';
    var error = Error.call(this, message);
    this.name = this.title;
    this.message = error.message;
    this.stack = error.stack;
    this.messages = [error.message, error.stack];
}

ApyError.prototype = Object.create(Error.prototype);
ApyError.prototype.constructor = ApyError;

// Common Eve-based backend methods

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

function messages(eveError) {
    var messages = [];
    if(Array.isArray(eveError)) {
        messages = eveError;
    }
    else if(isObject(eveError) && eveError.data && eveError.data._issues) {
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
        messages.push('No details found!')
    }
    return messages;
}


/**
 * Define a specific Eve Error base class
 *
 * @param eveError: Any Eve Error
 * @constructor
 */
function ApyEveError(eveError) {
    var error = Error.call(this, title(eveError));
    this.name = 'ApyEveError';
    this.title = this.message = error.message;
    this.stack = error.stack;
    this.messages = messages(eveError);
}

ApyEveError.prototype = Object.create(Error.prototype);
ApyEveError.prototype.constructor = ApyEveError;


/**
 * Define a specific Eve Error class to handle HTTP Error
 *
 * @param eveError: The HTTP Error
 * @constructor
 */
function ApyEveHTTPError(eveError) {
    var error = Error.call(this, title(eveError));
    this.name = 'ApyEveHTTPError';
    this.title = this.message = error.message;
    this.stack = error.stack;
    this.messages = messages(eveError);
}

ApyEveHTTPError.prototype = Object.create(Error.prototype);
ApyEveHTTPError.prototype.constructor = ApyEveHTTPError;
