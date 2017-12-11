/**
 * @module utils
 * @license MIT
 * @version 2017/12/11
 */

var SOH = '\x01';
var STX = '\x02';
var ETX = '\x03';
var ACK = '\x06';

/**
 * @function encode
 * @param {string} name
 * @param {string} message
 * @returns {string}
 */
export function encode(name, message) {
  return SOH + name + STX + message + ETX;
}

/**
 * @function decode
 * @param {string} name
 * @param {string} message
 * @returns {string}
 */
export function decode(name, message) {
  var prefix = SOH + name + STX;

  return message.slice(prefix.length, -1);
}

/**
 * @function isLegal
 * @param {string} name
 * @param {string} message
 * @returns {boolean}
 */
export function isLegal(name, message) {
  var prefix = SOH + name + STX;

  return message.indexOf(prefix) === 0 && message.indexOf(ETX) === message.length - 1;
}

/**
 * @function fallback
 * @param {string} name
 * @param {Function} callback
 * @returns {Function}
 */
export function fallback(name, callback) {
  name = ACK + '-Target-' + name;

  if (typeof callback === 'function') {
    window.navigator[name] = callback;
  }

  return window.navigator[name];
}
