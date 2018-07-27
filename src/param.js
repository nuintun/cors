/**
 * @module param
 * @license MIT
 * @version 2017/12/14
 */

import { typeOf, isArray } from './utils';

/**
 * @function buildParams
 * @param {string} prefix
 * @param {any} object
 * @param {Function} add
 */
function buildParams(prefix, object, add) {
  if (isArray(object)) {
    var value;

    // Serialize array item
    for (var i = 0, length = object.length; i < length; i++) {
      value = object[i];

      // Item is non-scalar (array or object), encode its numeric index
      buildParams(prefix + '[' + (typeOf(value) === 'object' && value != null ? i : '') + ']', value, add);
    }
  } else if (typeOf(object) === 'object') {
    // Serialize object item
    for (var name in object) {
      buildParams(prefix + '[' + name + ']', object[name], add);
    }
  } else {
    // Serialize scalar item
    add(prefix, object);
  }
}

/**
 * @function param
 * @description Serialize an array or a set of key/values into a query string
 * @param {Array|Object} object
 * @returns {string}
 * @see https://github.com/jquery/jquery/blob/master/src/serialize.js
 */
export default function param(object) {
  var params = [];

  function add(key, value) {
    // If value is a function, invoke it and use its return value
    value = typeof value === 'function' ? value() : value;

    params[params.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value == null ? '' : value);
  }

  // If an array was passed in, assume that it is an array of key/values
  if (isArray(object)) {
    var item;

    for (var i = 0, length = object.length; i < length; i++) {
      item = object[i];

      add(item.name, item.value);
    }
  } else if (typeOf(object) === 'object') {
    // Encode params recursively
    for (var prefix in object) {
      buildParams(prefix, object[prefix], add);
    }
  } else {
    return String(object);
  }

  // Return the resulting serialization
  return params.join('&');
}
