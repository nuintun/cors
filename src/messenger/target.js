/**
 * @module target
 * @license MIT
 * @version 2017/12/11
 */

import { typeOf } from '../utils';
import { encode, fallback } from './utils';
import { supportMessage } from './support';

/**
 * @class Target
 * @constructor
 * @param {string} name
 * @param {window} target
 * @param {string} namespace
 * @param {prefix}
 */
export default function Target(name, target, namespace) {
  this.name = String(name);
  this.namespace = namespace;
  this.target = target;
}

/**
 * @public
 * @method send
 * @param {string} message
 */
if (supportMessage) {
  Target.prototype.send = function(message) {
    this.target.postMessage(encode(this.name, message, this.namespace), '*');
  };
} else {
  Target.prototype.send = function(message) {
    var callback = fallback(this.name, this.namespace);

    if (typeof callback === 'function') {
      callback(encode(message), window);
    } else {
      throw new Error('Target callback function is not defined');
    }
  };
}
