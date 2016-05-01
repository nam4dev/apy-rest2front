'use strict';

angular.module('apy.version.version-directive', [])

.directive('apyVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);
