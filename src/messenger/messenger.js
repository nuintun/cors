/**
 * @module messenger
 * @license MIT
 * @version 2017/12/07
 */

import Target from './target';
import { supportMessage } from './support';
import { decode, isLegal, fallback } from './utils';
import { supportIEEvent, supportW3CEvent } from '../support';

/**
 * @class Messenger
 * @constructor
 * @param {string} name
 */
export default function Messenger(name, namespace) {
  this.name = String(name);
  this.namespace = arguments.length > 1 ? String(namespace) : 'Messenger';

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
  var namespace = this.namespace;
  var listens = this.listens;

  function callback(event) {
    var message = event.data;

    if (isLegal(name, message, namespace)) {
      var origin = event.origin;

      message = decode(name, message, namespace);

      for (var i = 0, length = listens.length; i < length; i++) {
        listens[i](message, origin);
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
    fallback(name, callback, namespace);
  }
};

/**
 * @public
 * @method add
 * @description Add a target
 * @param {window} target
 */
Messenger.prototype.add = function(name, target, origin) {
  this.targets[name] = new Target(name, target, origin, this.namespace);
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
Messenger.prototype.send = function(message, target, origin) {
  var targets = this.targets;

  if (arguments.length > 1) {
    target = String(target);

    if (targets.hasOwnProperty(target)) {
      targets[target].send(message, origin);
    }
  } else {
    for (var name in targets) {
      if (targets.hasOwnProperty(name)) {
        targets[name].send(message, origin);
      }
    }
  }
};
