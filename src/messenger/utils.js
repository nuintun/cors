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
 * @function prefix
 * @param {string} name
 * @param {string} namespace
 * @returns {string}
 */
function prefix(name, namespace) {
  return SOH + namespace + '-' + name + STX;
}

/**
 * @function encode
 * @param {string} name
 * @param {string} message
 * @param {string} namespace
 * @returns {string}
 */
export function encode(name, message, namespace) {
  return prefix(name, namespace) + JSON.stringify(message) + ETX;
}

/**
 * @function decode
 * @param {string} name
 * @param {string} message
 * @param {string} namespace
 * @returns {string}
 */
export function decode(name, message, namespace) {
  message = message.slice(prefix(name, namespace).length, -1);

  // Error catch
  try {
    return JSON.parse(message);
  } catch (error) {
    return message;
  }
}

/**
 * @function isLegal
 * @param {string} name
 * @param {string} message
 * @param {string} namespace
 * @returns {boolean}
 */
export function isLegalMessage(name, message, namespace) {
  return message.indexOf(prefix(name, namespace)) === 0 && message.lastIndexOf(ETX) === message.length - 1;
}

/**
 * @function findSourceName
 * @param {window} source
 * @param {Object} targets
 * @returns {string|null}
 */
export function findSourceName(source, targets) {
  for (var name in targets) {
    if (targets.hasOwnProperty(name) && targets[name] === source) {
      return name;
    }
  }

  return null;
}
