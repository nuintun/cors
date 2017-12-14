/**
 * @module fetch
 * @license MIT
 * @version 2017/12/07
 */

import { typeOf } from './utils';

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

export default function fetch(url, options) {
  options = options || {};
  options.method = normalizeMethod(options.method);
  options.cache = options.cache !== false;
  options.data = options.data || {};
  options.headers = options.headers || {};

  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
  });
}
