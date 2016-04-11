(function (angular) {'use strict';

    var endpoint = 'http://localhost:8000/',
        endpointStaging = 'http://wishlist.apy-consulting.com:8000/',
        schemaName = 'schemas',
        appTheme = 'bootstrap3',
        application = angular.module('apy', [
            'ngRoute',
            'ngAnimate',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.tree',
            'apy.view',
            'apy.version'
        ]),
        schemas;

    application.provider("apy", function apyProvider () {
        this.$get = function apyFactory () {
            var $injector = angular.injector(['ng', 'ngFileUpload']),
                $log = $injector.get('$log'),
                $http = $injector.get('$http'),
                Upload = $injector.get('Upload'),
                config = {
                    pkName: '_id',
                    appTheme: appTheme,
                    excludedEndpointByNames: ['logs']
                };
            return new ApyCompositeService($log, $http, Upload, config);
        };
    });

    application.config(['$routeProvider', 'apyProvider', function($routeProvider, apyProvider) {
        // Getting an apyProvider instance
        var provider = apyProvider.$get()
            //.initEndpoints(endpoint, schemaName)
            .initEndpoints(endpointStaging, schemaName)
            .loadSchemas();

        var schemasAsArray = provider.$schemasAsArray;
        schemas = provider.$schemas;
        // setting each schema's route
        angular.forEach(schemasAsArray, function (schema) {
            $routeProvider.when(schema.route, {
                templateUrl: 'components/apy-eve/viewRefacto.html',
                controller: 'ApyViewCtrl',
                name: schema.name
            });
        });
        // setting index route
        $routeProvider.when('/index', {
            controller: 'IndexCtrl',
            name: 'index'
        });
        // default route
        $routeProvider.otherwise({redirectTo: 'index'});
    }]);

    application.controller('IndexCtrl', ['$scope', '$log', '$route', 'apy', 'Upload',
        function ($scope, $log, $route, apyProvider, Upload) {
            //apyProvider.initEndpoints(endpoint, schemaName).setDependencies(
            apyProvider.initEndpoints(endpointStaging, schemaName).setDependencies(
                {name: "Upload", value: Upload}
            ).setSchemas(schemas);
            $scope.$schemas = apyProvider.$schemasAsArray;
            $scope.$route = $route;
        }]);

})(window.angular);
