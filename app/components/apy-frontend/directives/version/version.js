'use strict';

angular.module('apy.version', [
  'apy.version.interpolate-filter',
  'apy.version.version-directive'
])

.value('version', '0.5');
