/* istanbul ignore next */
(function ($apy) {

    $apy.customSettings = {
        // Custom Settings here (cf. documentation for all possibilities)
        // npm run build -- --settings="./mySettings.js"
        endpoints: {
            root: {
                port: 5000,
                hostname: "http://127.0.0.1"
            }
        },
        authentication: {
            enabled: true,
            // Can be another endpoint than Root one.
            endpoint: 'http://127.0.0.1:5000/auth',
            isEnabled: function() {
                return true;
            },
            // eslint-disable-next-line no-unused-vars
            transformData: function (data) {
                // For instance one can adapt
                // the backend according ones needs:

                // data.email = data.username;
                // delete data.username;
            },
            // eslint-disable-next-line no-unused-vars
            transformResponse: function(authUser) {
                // For instance one can adapt
                // the backend according ones needs:

                // var transformed = JSON.parse(authUser);
                // transformed.token_type = 'Bearer';
                // transformed.access_token = transformed.token;
                // delete transformed.token;
                // return JSON.stringify(transformed);
            }
        },
        schemaOverrides: {
            // 'MyEndpoint': {
            //     '$render': function (field) {
            //         // Use the field to customize the Resource rendering
            //         // return field.myProperty;
            //     }
            // }, ...
        },
        development: {
            enabled: true
        }
    };

})(apy);