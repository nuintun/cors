/**
 * @module messenger
 * @license MIT
 * @version 2017/12/07
 */

import Target from './target';
import { decode, isLegal, fallback } from './utils';
import { supportMessage, supportIEEvent, supportW3CEvent } from './support';

/**
 * @class Messenger
 * @constructor
 * @param {string} name
 */
export default function Messenger(name) {
  this.name = String(name);

  this.targets = {};
  this.listens = [];

  this.init();
}

/**
 * @private
 * @method init
 */
Messenger.prototype.init = function() {
  var name = this.name;
  var listens = this.listens;

  function callback(message) {
    if (typeof message === 'object' && message.data) {
      message = message.data;
    }

    if (isLegal(name, message)) {
      message = decode(name, message);

      for (var i = 0, length = listens.length; i < length; i++) {
        listens[i](message);
      }
    }
  }

  if (supportMessage) {
    if (supportW3CEvent) {
      window.addEventListener('message', callback, false);
    } else if (supportIEEvent) {
      window.attachEvent('onmessage', callback);
    }
  } else {
    // Compact IE6-7
    fallback(this.name, callback);
  }
};

/**
 * @public
 * @method add
 * @description Add a target
 * @param {window|iframe} target
 */
Messenger.prototype.add = function(name, target) {
  this.targets[name] = new Target(name, target);
};

/**
 * @public
 * @method listen
 * @param {Function} callback
 */
Messenger.prototype.listen = function(callback) {
  this.listens.push(callback);
};

/**
 * @public
 * @method clear
 */
Messenger.prototype.clear = function() {
  this.listens = [];
};

/**
 * @public
 * @method send
 * @param {string} message
 */
Messenger.prototype.send = function(message) {
  var targets = this.targets;

  for (var name in targets) {
    if (targets.hasOwnProperty(name)) {
      targets[name].send(message);
    }
  }
};
