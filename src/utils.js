/**
 * @module utils
 * @license MIT
 * @version 2017/12/07
 */

var UID = 0;

/**
 * @function uid
 * @returns {string}
 */
export function uid() {
  return 'UID-' + UID++;
}

var toString = Object.prototype.toString;

/**
 * @function typeOf
 * @param {any} value
 * @returns {string}
 */
export function typeOf(value) {
  if (value === null) return 'null';

  if (value === void 0) return 'undefined';

  return toString
    .call(value)
    .slice(8, -1)
    .toLowerCase();
}

/**
 * @function isArray
 * @param {any} value
 * @returns {boolean}
 */
export var isArray = Array.isArray
  ? function(value) {
      return Array.isArray(value);
    }
  : function(value) {
      return typeOf(value) === 'array';
    };

var DOMAIN_RE = /^([a-z0-9.+-]+:)?\/\/(?:[^/:]*(?::[^/]*)?@)?([^/]+)/i;

/**
 * @function domain
 * @param {string} url
 * @returns {string}
 */
export function domain(url) {
  var matched = DOMAIN_RE.exec(url);

  if (matched === null) {
    url = location.protocol + '//' + location.hostname + location.port;
  } else {
    var protocol = matched[1];
    var domain = matched[2];

    url = (protocol || location.protocol) + '//' + domain;

    if (protocol === 'http') {
      url = url.replace(/:80$/, '');
    } else if (protocol === 'https') {
      url = url.replace(/:443$/, '');
    }
  }

  return url;
}
