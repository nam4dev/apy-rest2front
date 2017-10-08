![Apy REST2Front Logo](./design/apy-rest2front-avatar.png)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)
[![Coverage Status](https://coveralls.io/repos/github/nam4dev/apy-rest2front/badge.svg?branch=master)](https://coveralls.io/github/nam4dev/apy-rest2front?branch=master)
[![Github Build Status](https://travis-ci.com/nam4dev/apy-rest2front.svg?token=xmj27dsr9gMzXM1ACqjL&branch=master)](https://travis-ci.com/nam4dev/apy-rest2front)
[![Documentation](https://media.readthedocs.org/static/projects/badges/passing.svg)](https://nam4dev.github.io/apy-rest2front/)

# Apy REST2Front — Administrate your REST API instantly.

Apy REST2Front is a small project, mostly meant as a proof of concept, to automate frontend CRUD views application based on REST API schema definitions.

It tries to implement a generic data binding upon a REST API system to Web MMI.
Authentication is managed only for Token-based, Oauth2 protocols, others shall be implemented :).

For now, only [`python-eve`][eve] REST API framework has been integrated.
For UI components (data representation & bindings), [`AngularJs`][angular] is used. 
Anyhow, `apy-rest2front` is intended to be plugged to any `UI` or `Backend` framework (**at worst, implement it :)**).

## Getting Started

To get you started you can simply clone the `apy-rest2front` repository and install the dependencies:

### Prerequisites

You need git to clone the `apy-rest2front` repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test `apy-rest2front`. You must have node.js and
its package manager installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

The project uses [Yarn](https://yarnpkg.com/en/) as package manager.

[Yarn installation](https://yarnpkg.com/en/docs/install)

[Yarn CLI details](https://yarnpkg.com/en/docs/cli)

### Clone `apy-rest2front`

Clone the `apy-rest2front` repository using [git][git]:

```
git clone https://github.com/nam4dev/apy-rest2front.git
cd apy-rest2front
```

If you just want to start a new project without the `apy-rest2front` commit history then you can do:

```bash
git clone --depth=1 https://github.com/nam4dev/apy-rest2front.git <your-project-name>
```

The `depth=1` tells git to only pull down one commit worth of historical data.

### Install Dependencies

We have two kinds of dependencies in this project: tools and `apy-rest2front` framework code.  The tools help
us manage and test the application.

* We get both, tools we depend upon and `apy-rest2front` code via `yarn`, the [node package manager][yarn].

So we can simply do:

```
yarn
```

You should find that you have two new folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/components` - contains the `apy-rest2front` framework files (symlink to node_modules/@bower_components)

*Note that the `components` folder is symlinked in the app folder as it makes
it easier to serve the files by a webserver.*

## Get Configured

### Backend

#### Eve

In order to visualize `apy-rest2front` AngularJs implementation,
we shall ensure our backend has following settings enabled,
```python
    XML = False
    JSON = True
    # For dynamic backend' schemas to frontend mapping
    SCHEMA_ENDPOINT = 'your-schema-endpoint-name'
```
**If one cannot expose `schemas` endpoint,
see [Advanced Frontend Configuration](#toc15__anchor), specifically, [Static backend mapping](#toc18__anchor)**

To ensure user experience of Media document(s) visualisation,

```python
    RETURN_MEDIA_AS_BASE64_STRING = False
    RETURN_MEDIA_AS_URL = True
    EXTENDED_MEDIA_INFO = ['content_type', 'name']
```

And to guarantee Media resources to be properly saved, especially when included in complex schema,

```python
    AUTO_CREATE_LISTS = True
    AUTO_COLLAPSE_MULTI_KEYS = True
    MULTIPART_FORM_FIELDS_AS_JSON = True
```

### Frontend

#### AngularJs

##### Create a Settings file

Simply create a settings file (for example, ``mySettings.js``) through CLI.

```
yarn create -- --settings=./mySettings.js
```

##### Configure the Settings file

```javascript
/* istanbul ignore next */
(function () {

    apy.customSettings = {
        // configuration here
        endpoints: {
            excluded: [
                "<your-REST-API-excluded-endpoint>" // ie. logs
            ],
            definitions: "<your-REST-API-schemas-endpoint>", // ie. schemas
            root: {
                port: "<your-REST-API-endpoint-port>", // default 80
                hostname: "<your-REST-API-endpoint-url>", // default http://localhost
            }
        },
        authentication: {
            // see Authentication section
        },
        // Override any endpoint schema here
        // Some facilities can be used here as $displayed, $render
        schemaOverrides: {
            // see section
        }
    };

})();

```

## Build

Build is preconfigured with a simple command.  Simply run:

```
yarn build
```

**Several folders are created during this process**

```
build/          Root directory
  app/          Apy REST2Front minified application (configured with appropriated settings)
  docs/         Apy REST2Front documentation
  coverage/     Apy REST2Front coverage (open ./coverage/index.html)
```

## Run the Build

### Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
yarn start
```

**We need to ensure `Eve REST API` is running on our configured `endpoint`**

Now browse to the app folder at [`http://localhost:9000/build/app`](http://localhost:9000/build/app).

### Coverage

Simply browse to the coverage folder at [`http://localhost:9000/build/coverage`](http://localhost:9000/build/coverage).

**Then select the desired browser folder (eg. `PhantomJS 2.1.1 (Linux 0.0.0)/`)**

### Documentation

Simply browse to the docs folder at [`http://localhost:9000/build/docs`](http://localhost:9000/build/docs).

`Enjoy :)`

## Advanced Configuration

This section describes how to tweak Apy REST2Front behavior based on settings.

### Authentication

Refer to [Create a Settings file](#create-a-settings-file) section.

#### Oauth2

```javascript
/* istanbul ignore next */
(function () {

    apy.customSettings = {
        // configuration here
        endpoints: {
            //...
        },
        authentication: {
            enabled: true,
            grant_type: 'password', // OAuth2 Grant Type
            client_id: '0123456789yljgk98765432101kFEAHAAAH' // OAuth2 Client ID
            endpoint: '<your-REST-API-auth-endpoint-url>', // ie. http://localhost:5000/oauth2
            // Here you can adapt the data
            // received from your authentication server.
            // In order to fit expected format (email, password)
            transformData: function (data) {
                // for instance, if you use username
                // data.email = data.username;
                // delete data.username;
            },
            // Here you can adapt the Response
            // received from your authentication server.
            // In order to fit expected format (token_type, access_token)
            transformResponse: function(authUser) {
                // var transformed = JSON.parse(authUser);
                // transformed.token_type = 'Bearer';
                // transformed.access_token = transformed.token;
                // delete transformed.token;
                // return JSON.stringify(transformed);
                return authUser;
            }
        },
        // Override any endpoint schema here
        // Some facilities can be used here as $displayed, $render
        schemaOverrides: {
            //...
        }
    };

})();

```

#### Token-based

```javascript
/* istanbul ignore next */
(function () {

    apy.customSettings = {
        // configuration here
        endpoints: {
            //...
        },
        authentication: {
            enabled: true,
            endpoint: '<your-REST-API-auth-endpoint-url>', // ie. http://localhost:5000/authenticate
            // Here you can adapt the data
            // received from your authentication server.
            // In order to fit expected format (email, password)
            transformData: function (data) {
                // for instance, if you use username
                // data.email = data.username;
                // delete data.username;
            },
            // Here you can adapt the Response
            // received from your authentication server.
            // In order to fit expected format (token_type, access_token)
            transformResponse: function(authUser) {
                // var transformed = JSON.parse(authUser);
                // transformed.token_type = 'Bearer';
                // transformed.access_token = transformed.token;
                // delete transformed.token;
                // return JSON.stringify(transformed);
                return authUser;
            }
        },
        // Override any endpoint schema here
        // Some facilities can be used here as $displayed, $render
        schemaOverrides: {
            //...
        }
    };

})();

```

**For backend authentication, refer to appropriated documentation**

- **[Eve REST API Python framework - Authentication][eve-auth]**

### Static backend mapping

``Apy REST2Front`` allow one to specify a static snapshot of its Endpoints definition (JSON) into settings (see below example).

***This is usually done when schemas endpoint cannot be enabled***

**Important** One assumes those exact settings are present in the backend (DOMAIN) as follow

**Endpoints definition example**

* backend, [Eve REST API Python framework][eve]

```python
# settings.py

POST = {
    'item_title': "Post",
    'schema': {
        'description': {
            'type': "string"
        },
        'title': {
            'type': "string"
        }
    }
}

MEMBER = {
    'item_title': "Member",
    'schema': {
        'posts':{
            'type': "list",
            'schema': {
                'type': "objectid",
                'data_relation': {
                    'resource': "posts",
                    'embeddable': True
                }
            }
        },
        'email': {
            'type': 'string',
            'minlength': 6,  # <1.letter>@<1.letter>.<2.letters>
            'maxlength': 128,
            'unique': True, # 'email' is an API entry-point, so we need it to be unique.
            'required': True
        },
        'firstName': {
            'type': "string"
        },
        'lastName': {
            'type': "string"
        },
        'token': {
            'type': "string"
        },
        'password': {
            'type': "string",
            'required': True,
        },
        'home': {
            'required': False,
        }
    }
}

# ...

DOMAIN = {
    'posts': POST,
    'members': MEMBER
}
```

* frontend, [AngularJS][angular]


```javascript
/* istanbul ignore next */
(function () {

    apy.customSettings = {
        // configuration here
        endpoints: {
            // ...
        },
        authentication: {
            // ...
        },
        // Override any endpoint schema here
        // Some facilities can be used here as $displayed, $render
        schemaOverrides: {
            members: {
                $items_title: "User", // Will display
                home: {
                    $displayed: false
                },
                token: {
                    $render: function () {
                        return '******';
                    }
                },
                password: {
                    $render: function () {
                        return '******';
                    }
                },
            }
        }
    };

})();

```

#### Overriding backend's endpoint(s)

``Apy REST2Front`` allow one to override a backend's endpoint when this one does not define a schema for a particular `Resource`.

To get a better understanding see below example :)

**Endpoints definition Override example**

* backend, [Eve REST API Python framework][eve]

```python
# settings.py

SCHEMA_LESS_LIST = {
    'schema': {
        'lists': {
            # Eve/Mongo allows schema-less Resource
            'type': 'list'
        }
    }
}

# ...

DOMAIN = {
    'Lists': SCHEMA_LESS_LIST
}
```

* frontend, [AngularJS][angular]

```javascript
/* istanbul ignore next */
(function () {

    apy.customSettings = {
        // configuration here
        endpoints: {
            // ...
        },
        authentication: {
            // ...
        },
        // Override any endpoint schema here
        // Some facilities can be used here as $displayed, $render
        schemaOverrides: {
            // Endpoint schema override
            lists: {
                type: 'list',
                schema: {
                    type: "datetime",
                    default: function() {
                        return new Date();
                    }
                }
            }
        }
    };

})();

```

## Testing

There are two kinds of tests in the `apy-rest2front` application: Unit tests and End to End tests.

### Running Unit Tests

The `apy-rest2front` app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found into `apy-rest2front/tests` folder and are named as `test_*.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
yarn test-with-watcher (dev mode through karma)
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
yarn test (single run through gulp & karma)
```

### End to end testing

The `apy-rest2front` app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular-based applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
yarn start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The `apy-rest2front`
project comes with a predefined script to do this:

```
yarn update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
yarn protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.

**Note that very few e2e tests have been made**


## Updating Apy REST2Front

Previously we recommended that you merge in changes to `apy-rest2front` into your own fork of the project.
Now that the `apy-rest2front` framework library code and tools are acquired through package managers (npm and
bower) you can use these tools instead to update the dependencies.

You can update both, tool & `apy-rest2front` dependencies by running:

```
yarn update
```

## Serving the Application Files

While `apy-rest2front` is client-side-only technology, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The `apy-rest2front` project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo yarn global add http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 9000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.

## [Contributing](CONTRIBUTING.md)
## [Contributors](CONTRIBUTORS.md)
## [Road Map](ROADMAP.md)
## [Github Repository][apy-rest2front-github]

[eve]: http://python-eve.org/
[eve-auth]: http://python-eve.org/authentication.html
[angular]: https://angularjs.org/
[AngularJS]: https://angularjs.org/
[react]: https://facebook.github.io/react/
[dj-rest-fwk]: http://www.django-rest-framework.org/
[apy-rest2front-github]: https://github.com/nam4dev/apy-rest2front
[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io
[http-server]: https://github.com/nodeapps/http-server
