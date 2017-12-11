/**
 * @module target
 * @license MIT
 * @version 2017/12/11
 */

import { encode, fallback } from './utils';
import { supportMessage } from './support';

/**
 * @class Target
 * @constructor
 * @param {string} name
 * @param {window} target
 * @param {prefix}
 */
export default function Target(name, target) {
  this.name = String(name);
  this.target = target;
}

/**
 * @public
 * @method send
 * @param {string} message
 */
if (supportMessage) {
  Target.prototype.send = function(message) {
    this.target.postMessage(encode(this.name, message), '*');
  };
} else {
  Target.prototype.send = function(message) {
    var callback = fallback(this.name);

    if (typeof callback === 'function') {
      callback(encode(message), window);
    } else {
      throw new Error('Target callback function is not defined');
    }
  };
}
