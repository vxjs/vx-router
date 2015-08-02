'use strict';

var Promise      = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var util         = require('./util');

module.exports = Router;

function Router() {
  this.routes = [];
  this.timeout = 5000;
}

Router.prototype = Object.create(EventEmitter.prototype);

/**
 * @method addRoute
 * @param {string} str
 * @param {function} fn
 * @param {object} ctx
 */
Router.prototype.addRoute = function (str, fn, ctx) {
  var pattern = util.createPatternFromStr(str);

  this.routes.push({
    pattern : pattern,
    fn      : fn,
    ctx     : ctx
  });
};

/**
 * @method route
 * @param {string} path
 * @param {object} meta Meta data about the request
 * @returns {Promise}
 */
Router.prototype.route = function (path, meta) {
  var matchedRoute, params;

  return new Promise(function (resolve, reject) {
    this.routes.some(function (route) {
      var match = path.match(route.pattern.re);

      if (match) {
        matchedRoute = route;
        params       = match.slice(1);
        return true;
      }
    }, this);

    if (matchedRoute) {
      params.unshift(meta);
      matchedRoute.fn.apply(matchedRoute.ctx, params).then(resolve, reject);
    } else {
      reject({ status: 404, err: new Error('No matching route') });
    }
  }.bind(this));
};

/**
 * @method onHttpRequest
 * @param {http.Request} request
 * @param {http.Response} response
 */
Router.prototype.onHttpRequest = function (request, response) {
  var timeout = setTimeout(function () {
    response.statusCode = 500;
    response.end('Request timed out');
  }, this.timeout);

  // Additional information about this request which the route
  // handler may find useful.
  var meta = {
    json: util.wantsJSON(request.headers.accept),
    qs: util.queryString(request.path)
  };

  this.route(util.stripQueryString(request.path), meta).then(function (content) {
    clearTimeout(timeout);

    if (typeof content === 'object') {
      content = JSON.stringify(content);
    }

    response.end(content);
  }, function (err) {
    var stack = err.stack || err.err.stack;
    var msg   = err.message || err.err.message;

    this.emit('error', {
      stack: stack,
      message: msg
    });

    clearTimeout(timeout);
    response.statusCode = err.status || 500;
    if (meta.json) {
      response.end({
        error: msg
      });
    } else {
      response.end(msg);
    }
  }.bind(this));
};
