# Apy Frontend — Develop your REST API frontend with ease

This project is a small automated frontend application based on a REST API schema. 
It tries to implement a generic data binding upon a REST API system. 
For now, [`python-eve`][eve] REST API framework has been integrated to Apy Frontend. 
For UI components (data representation & bindings), [`AngularJs`][angular] is used. 
Anyhow, `apy-frontend` is intended to be plugged to any `UI` or `Backend` framework (cf. **TODO List**).

## Getting Started

To get you started you can simply clone the `apy-frontend` repository and install the dependencies:

### Prerequisites

You need git to clone the `apy-frontend` repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test `apy-frontend`. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone `Apy Frontend`

Clone the `apy-frontend` repository using [git][git]:

```
git clone https://gitlab.com/namat4css/apy-frontend.git
cd apy-frontend
```

If you just want to start a new project without the `apy-frontend` commit history then you can do:

```bash
git clone --depth=1 https://gitlab.com/namat4css/apy-frontend.git <your-project-name>
```

The `depth=1` tells git to only pull down one commit worth of historical data.

### Install Dependencies

We have two kinds of dependencies in this project: tools and `apy-frontend` framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the `apy-frontend` code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the `apy-frontend` framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
`apy-frontend` changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.

## Directory Layout

```
apy-frontend/                   --> Apy frontend framework
  core/                         --> Apy frontend Core (fields, ...)
    components/                 --> Apy frontend Components (Collection, Resource, Field, ...)
      base.js                   --> Apy Base abstraction (for all Components)
      resource.js               --> Apy frontend Resource Component
      collection.js             --> Apy frontend Collection Component
      fields/                   --> Apy frontend fields (string, number, media, ...)
        geo/                    --> Apy frontend Geo fields (Point, Polygon, Line, ...)
          point.js              --> Apy frontend Geo Point abstraction
        field.js                --> Apy Field abstraction
        poly.js                 --> Apy PolyMorph field abstraction
        list.js                 --> Apy List field abstraction
        boolean.js              --> Apy Boolean field abstraction
        string.js               --> Apy String field abstraction
        datetime.js             --> Apy Datetime field abstraction
        hashmap.js              --> Apy HashMap (dict) field abstraction
        objectid.js             --> Apy Object ID (Resource) field abstraction
        media.js                --> Apy Media field logic (any type of Resource, file, picture, music, ...)
        number.js               --> Apy Number field logic (groups Integer, Float & Number types)
    core.js                     --> Apy frontend Core abstraction
    core.css                    --> Apy frontend Core CSS
    helper.js                   --> Apy frontend Core CSS
  frameworks/                   --> Groups all available UI/Back-end frameworks
    back/                       --> Groups all available Back-end frameworks
    front/                      --> Groups all available UI frameworks
      angular/                  --> Angular `starter` integration
        app.js                  --> Angular Controller/Settings definition
        view.html               --> Angular field views HTML representation
        view.js                 --> Angular field views abstraction
        directives/             --> All directives goes there
          version/              --> Directive to display current Project version
            version.js          --> ...
            ...
index.html                      --> Angular integration demonstration
  ...
```

## Frontend Configuration

In order to visualize `apy-frontend` AngularJs implementation,
you shall need to ensure your backend has following settings enabled,
```python
    XML = False
    JSON = True
    # For dynamic backend' schemas to frontend mapping
    SCHEMA_ENDPOINT = 'your-schema-endpoint-name'
```
**For static backend' schemas to frontend mapping, see [Advanced Frontend Configuration](#advanced-frontend-configuration), specifically, [Static backend mapping](#static-backend-mapping)**

Optionally, to increase user experience of Media document(s) visualisation,
```python
    RETURN_MEDIA_AS_BASE64_STRING = False
    RETURN_MEDIA_AS_URL = True
    EXTENDED_MEDIA_INFO = ['content_type', 'name']
```
Then on the frontend side, simply open ``apy-frontend/frameworks/front/angular/app.js`` file.
**And edit lines**,


```javascript
    var endpoint = 'http{s}://your.eve.REST.API.URI/';
    var schemaName = 'your-schema-endpoint-name';
```
Enjoy :)

## Advanced Frontend Configuration

This section describes how to tweak Apy Frontend behavior based on settings.

### Static backend mapping

``ApyFrontend`` allow one to specify a static snapshot of its Endpoints definition (JSON) into settings (see below example).

***This is usually done when schemas endpoint cannot be enabled***

**Important** One assumes those exact settings are present in the backend (DOMAIN) as follow

**Endpoints definition example**

* backend => [Eve REST API Python framework][eve]

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
            'type': "string"
        },
        'firstName': {
            'type': "string"
        },
        'lastName': {
            'type': "string"
        },
        'location': {
            'type': "dict",
            'schema': {
                'entered_date': {
                    'required': True,
                    'type': "datetime"
                },
                'details': {
                    'type': "dict",
                    'schema': {
                        'city': {
                            'required': True,
                            'type': "string"
                        },
                        'zip_code': {
                            'required': True,
                            'type': "integer"
                        },
                        'state': {
                            'type': "string"
                        },
                        'address': {
                            'required': True,
                            'type': "string"
                        },
                        'address_complement': {
                            'type': "string"
                        }
                    }
                }
            }
        }
    }
}

# ...

DOMAIN = {
    'posts': POST,
    'members': MEMBER
}
```

* frontend => [AngularJS][angular]

```javascript
// AngularJS Integration example
// apy-frontend/frameworks/front/angular/app.js

//...

application.provider("apy", function apyProvider () {
    this.$get = function apyFactory () {
        var $injector = angular.injector(['ng', 'ngFileUpload']);

        //...

        // Member's Post endpoint schema
        var post = {
            item_title: "Post",
            schema: {
                description: {
                    type: "string"
                },
                title: {
                    type: "string"
                }
            }
        };

        // Member endpoint schema (aka User)
        var user = {
            item_title: "Member",
            schema: {
                posts:{
                    type: "list",
                    schema: {
                        type: "objectid",
                        data_relation: {
                            resource: "posts",
                            embeddable: true
                        }
                    }
                },
                email: {
                    type: "string"
                },
                firstName: {
                    type: "string"
                },
                lastName: {
                    type: "string"
                },
                location: {
                    type: "dict",
                    schema: {
                        entered_date: {
                            required: true,
                            type: "datetime"
                        },
                        details: {
                            type: "dict",
                            schema: {
                                city: {
                                    required: true,
                                    type: "string"
                                },
                                zip_code: {
                                    required: true,
                                    type: "integer"
                                },
                                state: {
                                    type: "string"
                                },
                                address: {
                                    required: true,
                                    type: "string"
                                },
                                address_complement: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
        };

        //...

        config = {
            //...
            schemas: {
                posts: post,
                members: user
            }
        };
        return new ApyCompositeService($log, $http, Upload, config);
    };
});
```

#### Overriding backend's endpoint(s)

``ApyFrontend`` allow one to override a backend's endpoint when this one does not define a schema for a particular `Resource`.

To get a better understanding see below example :)

**Endpoints definition Override example**

* backend => [Eve REST API Python framework][eve]

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

* frontend => [AngularJS][angular]

```javascript
// AngularJS Integration example
// apy-frontend/frameworks/front/angular/app.js

var endpoint = 'http{s}://your.eve.REST.API.URI/';
var schemaName = 'your-schema-endpoint-name';

//...

application.provider("apy", function apyProvider () {
    this.$get = function apyFactory () {
        var $injector = angular.injector(['ng', 'ngFileUpload']);

        //...

        // endpoint schema override
        var lists = {
            item_title: "Interesting Events List",
            schema: {
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

        //...

        config = {
            //...
            schemas: {
                Lists: lists
            }
        };
        return new ApyCompositeService($log, $http, Upload, config);
    };
});
```

## Testing

There are two kinds of tests in the `apy-frontend` application: Unit tests and End to End tests.

### Running Unit Tests

The `apy-frontend` app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to end testing

The `apy-frontend` app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular-based applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The `apy-frontend`
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


## Updating Apy Frontend

Previously we recommended that you merge in changes to `apy-frontend` into your own fork of the project.
Now that the `apy-frontend` framework library code and tools are acquired through package managers (npm and
bower) you can use these tools instead to update the dependencies.

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the `apy-frontend` dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


## Serving the Application Files

While `apy-frontend` is client-side-only technology, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The `apy-frontend` project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


## Continuous Integration

### Travis CI

[Travis CI][travis] is a continuous integration service, which can monitor GitHub for new commits
to your repository and execute scripts such as building the app or running tests. The `apy-frontend`
project contains a Travis configuration file, `.travis.yml`, which will cause Travis to run your
tests when you push to GitHub.

You will need to enable the integration between Travis and GitHub. See the Travis website for more
instruction on how to do this.

### GitLab CI

[GitLab CI][gitlab-ci] is a continuous integration service, which can monitor GitLab for new commits
to your repository and execute scripts such as building the app or running tests. The `apy-frontend`
project contains a GitLab configuration file, `.gitlab-ci.yml`, which will cause GitLab to run your
tests when you push to GitLab.

## TODO List

- Configuration Templating System (ui / backend)
    - UI
        - Implement [`Angular`][angular] template
        - Implement [`React`][react] template
    - Backend
        - Implement [`Eve`][angular] template
        - Implement [`Django-rest-framework`][dj-rest-fwk] template

- Documentation enhancement.
    - Make doc-strings & API Documentation.

- Per Resource-based Authentication System.
- Data Validation enforced based on schema (when provided).
- Implement another `UI-framework`, such as [`React`][react].
- Implement another `Backend-framework`, such as [`Django-rest-framework`][dj-rest-fwk].
- Progress handler per Resource (PATCH, POST, DELETE).

## Contact

For more information, please check out [Apy Frontend][apy-frontend]

[eve]: http://python-eve.org/
[angular]: https://angularjs.org/
[react]: https://facebook.github.io/react/
[dj-rest-fwk]: http://www.django-rest-framework.org/
[apy-frontend]: https://gitlab.com/namat4css/apy-frontend
[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[gitlab-ci]: https://about.gitlab.com/gitlab-ci/
[http-server]: https://github.com/nodeapps/http-server
