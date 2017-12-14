/**
 * @module fetch
 * @license MIT
 * @version 2017/12/07
 */

import param from './param';
import { typeOf } from './utils';

var nonce = 0;
var QUERY_RE = /\?/;
var ENQ = encodeURIComponent('\x05');

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
      url += (QUERY_RE.test(url) ? '&' : '?') + ENQ + '=' + (+new Date() + nonce++);
    }
  }

  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        resolve(xhr);
      }
    };

    function rejectError(message) {
      reject(new TypeError('Request ' + url + ' ' + message));
    }

    xhr.ontimeout = function() {
      rejectError('timeout');
    };

    xhr.onabort = function() {
      rejectError('aborted');
    };

    xhr.onerror = function() {
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
