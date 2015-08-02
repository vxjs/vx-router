var Router = hmt.lib('Router');

describe('Router', function () {
  var router;
  var errors;

  beforeEach(function () {
    errors = [];
    router = new Router();
    router.timeout = 10;
    router.on('error', function (err) {
      errors.push(err);
    });
  });

  describe('route', function () {
    it('invalid route', function (done) {
      router
        .route('/foo/bar', {})
        .then(done)
        .then(null, function (err) {
          hmt.assert.equal(err.status, 404);
          done();
        });
    });

    it('valid route with no error', function (done) {
      var ctx = {name: 'someValue'};
      var fn = function () {
        hmt.assert.equal(this, ctx);
        return new Promise(function (resolve, reject) {
          resolve();
        });
      };

      router.addRoute('/foo/bar/:biz', fn, ctx);
      router
        .route('/foo/bar/sanohe', {})
        .then(function () {
          done();
        })
        .then(null, done);
    });

    it('valid route with params and query string', function (done) {
      var ctx = {name: 'someValue'};
      var fn = function (meta, name) {
        hmt.assert.equal(this, ctx);
        hmt.assert.equal(name, 'seth');
        return new Promise(function (resolve, reject) {
          resolve();
        });
      };

      router.addRoute('/foo/bar/:name', fn, ctx);
      router
        .route('/foo/bar/seth', {})
        .then(function () {
          done();
        })
        .then(null, done);
    });

    it('valid route with error', function (done) {
      var fn = function () {
        return new Promise(function (resolve, reject) {
          reject();
        });
      };

      router.addRoute('/foo/bar', fn, null);
      router
        .route('/foo/bar', {})
        .then(function () {
          done(new Error('should not resolve'));
        })
        .then(null, done);
    });
  });

  describe('onHttpRequest', function () {
    it('should not route invalid request', function (done) {
      var fn = function () {
        return new Promise(function (resolve, reject) {
          resolve();
        });
      };

      var endMock = function (result) {
        try {
          hmt.assert.deepEqual(result, { error: 'No matching route for path /foo/thom/ano' });
          done();
        } catch (e) {
          done(e);
        }
      };

      router.addRoute('/foo/:type', fn, null);
      router.onHttpRequest(
        {
          path: '/foo/thom/ano?age=2',
          headers: { accept: 'application/json' }
        },
        {
          end: endMock
        }
      );
    });

    it('should handle valid request text/html with loose error', function (done) {
      var fn = function () {
        return new Promise(function (resolve, reject) {
          reject(new Error('uh-oh'));
        });
      };

      var endMock = function (result) {
        try {
          hmt.assert.equal(errors[0].message, 'uh-oh');
          hmt.assert.equal(errors[0].stack.length > 10, true);
          hmt.assert.equal(result, 'uh-oh');
          done();
        } catch (e) {
          done(e);
        }
      };

      router.addRoute('/foo/:type', fn, null);
      router.onHttpRequest(
        {
          path: '/foo/thom',
          headers: { accept: 'text/html' }
        },
        {
          end: endMock
        }
      );
    });

    it('should route valid request with object response', function (done) {
      var fn = function (meta, type, size) {
        hmt.assert.equal(type, 'thom');
        hmt.assert.equal(size, 'ano');
        hmt.assert.equal(meta.qs.age, '2');
        return new Promise(function (resolve, reject) {
          resolve({msg: 'hello world'});
        });
      };

      var endMock = function (result) {
        try {
          hmt.assert.equal(result, JSON.stringify({msg: 'hello world'}));
          done();
        } catch (e) {
          done(e);
        }
      };

      router.addRoute('/foo/:type/:size', fn, null);
      router.onHttpRequest(
        {
          path: '/foo/thom/ano?age=2',
          headers: { accept: 'text/html' }
        },
        {
          end: endMock
        }
      );
    });

    it('should route valid request with string response', function (done) {
      var fn = function (meta, type, size) {
        return new Promise(function (resolve, reject) {
          resolve('hello world');
        });
      };

      var endMock = function (result) {
        try {
          hmt.assert.equal(result, 'hello world');
          done();
        } catch (e) {
          done(e);
        }
      };

      router.addRoute('/foo/:type/:size', fn, null);
      router.onHttpRequest(
        {
          path: '/foo/thom/ano?age=2',
          headers: { accept: 'application/json' }
        },
        {
          end: endMock
        }
      );
    });

    it('should handle timeout', function (done) {
      var fn = function (meta, type, size) {
        hmt.assert.equal(type, 'thom');
        hmt.assert.equal(size, 'ano');
        hmt.assert.equal(meta.qs.age, '2');
        return new Promise(function (resolve, reject) {
        });
      };

      var response = {
        end: function (result) {
          try {
            hmt.assert.equal(result, 'Request timed out');
            hmt.assert.equal(response.statusCode, 500);
            done();
          } catch (e) {
            done(e);
          }
        }
      };

      router.addRoute('/foo/:type/:size', fn, null);
      router.onHttpRequest(
        {
          path: '/foo/thom/ano?age=2',
          headers: { accept: 'text/html' }
        },
        response
      );
    });
  });
});
