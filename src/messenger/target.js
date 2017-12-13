/**
 * @module target
 * @license MIT
 * @version 2017/12/11
 */

import { typeOf, domain } from '../utils';
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
export default function Target(name, target, origin, namespace) {
  this.name = String(name);
  this.target = target;
  this.origin = domain(origin);
  this.namespace = namespace;
}

/**
 * @public
 * @method send
 * @param {string} message
 */
if (supportMessage) {
  Target.prototype.send = function(message, origin) {
    console.log(origin, '------', this.origin);

    this.target.postMessage(encode(this.name, message, this.namespace), origin);
  };
} else {
  Target.prototype.send = function(message, origin) {
    if (origin === '*' || origin === this.origin) {
      var callback = fallback(this.name, this.namespace);

      if (typeof callback === 'function') {
        callback({ origin: this.origin, data: encode(message) });
      } else {
        throw new Error('Target callback function is not defined');
      }
    }
  };
}
