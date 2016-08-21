# Help me make it better :)

## Contributing to Apy Frontend

If you'd like to bring your brain into the party, do not hesitate a sec :)

To contribute simply fork this project then submit your Pull Request(s) - PR

### Continuous Integration

#### Travis CI

[Travis CI][travis] is a continuous integration service, which can monitor GitHub for new commits
to your repository and execute scripts such as building the app or running tests. The `apy-frontend`
project contains a Travis configuration file, `.travis.yml`, which will cause Travis to run your
tests when you push to GitHub.

You will need to enable the integration between Travis and GitHub. See the Travis website for more
instruction on how to do this.

#### GitLab CI

[GitLab CI][gitlab-ci] is a continuous integration service, which can monitor GitLab for new commits
to your repository and execute scripts such as building the app or running tests. The `apy-frontend`
project contains a GitLab configuration file, `.gitlab-ci.yml`, which will cause GitLab to run your
tests when you push to GitLab.

### TODO List

- Configuration Templating System (ui / backend)
    - UI
        - Implement [`Angular`][angular] template
        - Implement [`React`][react] template
    - Backend
        - Implement [`Eve`][angular] template
        - Implement [`Django-rest-framework`][dj-rest-fwk] template

- Documentation enhancement.
    - Make doc-strings & API Documentation.

- Enhance Apy configuration.
- Pagination system.
- Per Resource-based Authentication System.
- Data Validation enforced based on schema (when provided).
- Implement another `UI-framework`, such as [`React`][react].
- Implement another `Backend-framework`, such as [`Django-rest-framework`][dj-rest-fwk].
- Progress handler per Resource (PATCH, POST, DELETE).

[eve]: http://python-eve.org/
[angular]: https://angularjs.org/
[react]: https://facebook.github.io/react/
[dj-rest-fwk]: http://www.django-rest-framework.org/
[travis]: https://travis-ci.org/
[gitlab-ci]: https://about.gitlab.com/gitlab-ci/