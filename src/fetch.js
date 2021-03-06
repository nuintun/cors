/**
 * @module fetch
 * @license MIT
 * @version 2017/12/14
 */

import param from './param';

var nonce = 0;
var QUERY_RE = /\?/;
// ASCII PU1 use for no cache key
var PU1 = encodeURIComponent('\x91');

// HTTP methods whose capitalization should be normalized
var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

/**
 * @function normalizeMethod
 * @param {string} method
 * @returns {string}
 */
function normalizeMethod(method) {
  method = String(method);

  var upcased = method.toUpperCase();

  return methods.indexOf(upcased) > -1 ? upcased : method;
}

/**
 * @function cleanXHR
 * @param {XMLHttpRequest} xhr
 */
function cleanXHR(xhr) {
  xhr.onreadystatechange = null;
  xhr.onerror = null;
  xhr.ontimeout = null;
  xhr.onabort = null;
}

/**
 * @function fetch
 * @param {string} url
 * @param {Object} options
 * @returns {Promise}
 */
export default function fetch(url, options) {
  options = options || {};
  options.cache = options.cache !== false;
  options.headers = options.headers || {};
  options.data = options.hasOwnProperty('data') ? param(options.data) : null;
  options.method = options.hasOwnProperty('method') ? normalizeMethod(options.method) : 'GET';

  if (options.method === 'GET') {
    if (options.data !== null) {
      url += QUERY_RE.test(url) ? '&' + options.data : '?' + options.data;
    }

    if (options.cache) {
      url += (QUERY_RE.test(url) ? '&' : '?') + PU1 + '=' + (+new Date() + nonce++);
    }
  }

  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        cleanXHR(xhr);
        resolve(xhr);
      }
    };

    /**
     * @function rejectError
     * @param {string} message
     */
    function rejectError(message) {
      reject(new TypeError('Request ' + url + ' ' + message));
    }

    xhr.ontimeout = function() {
      cleanXHR(xhr);
      rejectError('timeout');
    };

    xhr.onabort = function() {
      cleanXHR(xhr);
      rejectError('aborted');
    };

    xhr.onerror = function() {
      cleanXHR(xhr);
      rejectError('failed');
    };

    xhr.open(options.method, url, true, options.username, options.password);

    var headers = options.headers;

    for (var key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, String(headers[key]));
      }
    }

    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    if (options.method === 'POST') {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    }

    xhr.send(options.method === 'POST' ? options.data : null);
  });
}
