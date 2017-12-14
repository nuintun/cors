/**
 * @module messenger
 * @license MIT
 * @version 2017/12/07
 */

import { supportIEEvent, supportW3CEvent } from '../support';
import { encode, decode, findSourceName, isLegalMessage } from './utils';

/**
 * @class Messenger
 * @constructor
 * @param {string} name
 */
export default function Messenger(name, namespace) {
  this['<name>'] = String(name);
  this['<namespace>'] = String(namespace);

  this['<sources>'] = {};
  this['<listeners>'] = [];

  this['<init>']();
}

/**
 * @private
 * @method <init>
 */
Messenger.prototype['<init>'] = function() {
  var name = this['<name>'];
  var sources = this['<sources>'];
  var namespace = this['<namespace>'];
  var listeners = this['<listeners>'];

  function callback(event) {
    // Get source name
    var source = findSourceName(event.source, sources);

    // Source must in sources
    if (source !== null) {
      var message = event.data;

      // Is message legal
      if (isLegalMessage(name, message, namespace)) {
        var origin = event.origin;

        // Decode message
        message = decode(name, message, namespace);

        for (var i = 0, length = listeners.length; i < length; i++) {
          listeners[i]({ data: message, origin: origin, source: source });
        }
      }
    }
  }

  // Bind message listener
  if (supportW3CEvent) {
    window.addEventListener('message', callback, false);
  } else if (supportIEEvent) {
    window.attachEvent('onmessage', callback);
  }
};

/**
 * @public
 * @method add
 * @description Add a source
 * @param {window} source
 */
Messenger.prototype.add = function(name, source) {
  this['<sources>'][name] = source;
};

/**
 * @public
 * @method onmessage
 * @description Add a onmessage listener
 * @param {Function} listener
 */
Messenger.prototype.onmessage = function(listener) {
  this['<listeners>'].push(listener);
};

/**
 * @public
 * @method send
 * @param {string} source If source equal *, sent to all sources
 * @param {string} message
 * @param {string} origin
 */
Messenger.prototype.send = function(source, message, origin) {
  source = String(source);

  var sources = this['<sources>'];
  var namespace = this['<namespace>'];

  if (source === '*') {
    for (source in sources) {
      if (sources.hasOwnProperty(source)) {
        sources[source].postMessage(encode(source, message, namespace), origin);
      }
    }
  } else {
    if (sources.hasOwnProperty(source)) {
      sources[source].postMessage(encode(source, message, namespace), origin);
    }
  }
};
