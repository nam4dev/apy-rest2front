'use strict';

describe('apy.version module', function() {
  beforeEach(module('apy.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
