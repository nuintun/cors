/**
 * @module messenger
 * @license MIT
 * @version 2017/12/07
 */

import { encode, decode, isLegal } from './utils';
import { supportIEEvent, supportW3CEvent } from '../support';

/**
 * @class Messenger
 * @constructor
 * @param {string} name
 */
export default function Messenger(name, namespace) {
  this['<name>'] = String(name);
  this['<namespace>'] = String(namespace);

  this['<targets>'] = {};
  this['<listeners>'] = [];

  this['<init>']();
}

/**
 * @private
 * @method <init>
 */
Messenger.prototype['<init>'] = function() {
  var name = this['<name>'];
  var namespace = this['<namespace>'];
  var listeners = this['<listeners>'];

  function callback(event) {
    var message = event.data;
    var origin = event.origin;

    if (isLegal(name, message, namespace)) {
      message = decode(name, message, namespace);

      for (var i = 0, length = listeners.length; i < length; i++) {
        listeners[i](message, origin);
      }
    }
  }

  if (supportW3CEvent) {
    window.addEventListener('message', callback, false);
  } else if (supportIEEvent) {
    window.attachEvent('onmessage', callback);
  }
};

/**
 * @public
 * @method add
 * @description Add a target
 * @param {window} target
 */
Messenger.prototype.add = function(name, target) {
  this['<targets>'][name] = target;
};

/**
 * @public
 * @method listen
 * @description Add a listener
 * @param {Function} listener
 */
Messenger.prototype.listen = function(listener) {
  this['<listeners>'].push(listener);
};

/**
 * @public
 * @method send
 * @param {string} name If name equal *, sent to all targets
 * @param {string} message
 * @param {string} origin
 */
Messenger.prototype.send = function(name, message, origin) {
  name = String(name);

  var targets = this['<targets>'];
  var namespace = this['<namespace>'];

  if (name === '*') {
    for (name in targets) {
      if (targets.hasOwnProperty(name)) {
        targets[name].postMessage(encode(name, message, namespace), origin);
      }
    }
  } else {
    if (targets.hasOwnProperty(name)) {
      targets[name].postMessage(encode(name, message, namespace), origin);
    }
  }
};
