var util = hmt.lib('util');

describe('util', function () {
  describe('convertStringPatternToRegExp', function () {
    it('simple pattern', function () {
      var pattern = '/foo/bar';
      var route = util.createPatternFromStr(pattern);

      hmt.assert.equal(route.re.test('/foo/bar'), true);
      hmt.assert.equal(route.re.test('/foo/bar/bar'), false);
      hmt.assert.equal(route.re.test('/foo/bar/'), true);
      hmt.assert.equal(route.re.test('abc/foo/bar/'), false);
      hmt.assert.equal(route.re.test('/foo/bar//'), true);
    });

    it('pattern with param', function () {
      var pattern = '/foobar/:biz';
      var route = util.createPatternFromStr(pattern);

      hmt.assert.equal(route.re.test('/foobar/snth'), true);
      hmt.assert.equal(route.re.test('/foobar'), false);
      hmt.assert.equal(route.re.test('/foobar/abc/def?ao=3'), false);
    });

    it('pattern with params', function () {
      var pattern = '/foobar/:biz/:baz';
      var route = util.createPatternFromStr(pattern);

      hmt.assert.equal(route.re.test('/foobar/snth'), false);
      hmt.assert.equal(route.re.test('/foobar/baraou/nath'), true);
      hmt.assert.equal(route.re.test('/foobar/baraou/nath/'), true);
      hmt.assert.equal(route.re.test('a/foobar/baraou/nath/'), false);
      hmt.assert.equal(route.re.test('/foobar/baraou/nath/th'), false);
    });
  });

  describe('wantsJSON', function () {
    it('should want JSON', function () {
      var accept = 'application/json';
      hmt.assert.equal(util.wantsJSON(accept), true);
    });

    it('should want JSON', function () {
      var accept = 'application/json,text/html,application/xhtml+xml,*/*;q=0.8';
      hmt.assert.equal(util.wantsJSON(accept), true);
    });

    it('should not want JSON', function () {
      var accept = 'text/html';
      hmt.assert.equal(util.wantsJSON(accept), false);
    });

    it('should not want JSON', function () {
      var accept = 'text/html,application/json,application/xhtml+xml,*/*;q=0.8';
      hmt.assert.equal(util.wantsJSON(accept), false);
    });

    it('should not want JSON', function () {
      var accept = null;
      hmt.assert.equal(util.wantsJSON(accept), false);
    });
  });

  describe('queryString', function () {
    it('parse three params', function () {
      var path = '/foo/bar?my%20age=55&name=einstein%20moore&happy';
      var qs   = util.queryString(path);

      hmt.assert.equal(qs['my age'], '55');
      hmt.assert.equal(qs.name, 'einstein moore');
      hmt.assert.equal(qs.happy, true);
    });

    it('handles path with no query string', function () {
      var path = '/foo/bar';
      var qs   = util.queryString(path);

      hmt.assert.equal(Object.keys(qs).length, 0);
    });

  });

  describe('stripQueryString', function () {
    it('should remove query string', function () {
      var str = util.stripQueryString('/foo/bar?abc=123&fofofo');
      hmt.assert.equal(str, '/foo/bar');
    });
  });
});
