'use strict';

describe('apy.version module', function() {
  beforeEach(module('apy.version'));

  describe('app-version directive', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span apy-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });
  });
});