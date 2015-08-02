'use strict';

module.exports = {
  /**
   * @method createPatternFromStr
   * @param {string} pattern
   * @returns {RegExp}
   */
  createPatternFromStr: function (str) {
    var reStr, paramNames;

    paramNames = [];
    reStr = str
      // allow wildcards (/foo/*)
      .replace(/\*/, '(.*)')

      // add wildcards for name parameters
      .replace(/:([^\/]*)/g, function () {
        paramNames.push(arguments[1]);
        return '([^\/]*)';
      })

      // escape '/' characters
      .replace(/\//g, '\/')

      // ensure start of string match (^)
      .replace(/^/, '\^')

      // allow trailing slashes (/foo/bar///)
      .replace(/$/, '\/*\$');


    return {
      re: new RegExp(reStr),
      paramNames: paramNames
    };
  },

  /**
   * @method wantsJSON
   * @param {string} accept Header value
   * @returns {boolean}
   */
  wantsJSON: function (accept) {
    var htmlIdx, jsonIdx;

    if (typeof accept !== 'string') {
      return false;
    }

    htmlIdx = accept.toLowerCase().indexOf('text/html');
    jsonIdx = accept.toLowerCase().indexOf('application/json');

    if (jsonIdx === -1) {
      return false;
    }

    if (htmlIdx === -1) {
      return true;
    }

    return (jsonIdx < htmlIdx);
  },

  /**
   * Parse query string values to hash
   * @param {string} path
   * @returns {object}
   */
  queryString: function (path) {
    var qs = {};

    var result = /\?(.*)/.exec(path);

    if (result && result[1]) {
      result[1].split('&').forEach(function (pair) {
        var pairResult = /([^=]*)=?(.*)/.exec(pair);
        var key        = decodeURIComponent(pairResult[1]);
        var value      = pairResult[2];

        if (value) {
          qs[key] = decodeURIComponent(value);
        } else {
          qs[key] = true;
        }
      });
    }

    return qs;
  },

  /**
   * Strip query string from path
   * @param {string} path
   * @returns {string}
   */
  stripQueryString: function (path) {
    return path.replace(/\?.*/, '');
  }
};
