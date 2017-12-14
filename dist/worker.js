/**
* @module cors
* @author nuintun
* @license MIT
* @version 0.0.1
* @description A pure JavaScript CORS framework.
* @see https://nuintun.github.io/cors
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('cors-worker', factory) :
  (global.CORSWorker = factory());
}(this, (function () { 'use strict';

  /**
   * @module utils
   * @license MIT
   * @version 2017/12/07
   */





  var DOMAIN_RE = /^([a-z0-9.+-]+:)?\/\/(?:[^/:]*(?::[^/]*)?@)?([^/]+)/i;

  function domain(url) {
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

  /**
   * @module utils
   * @license MIT
   * @version 2017/12/11
   */

  var SOH = '\x01';
  var STX = '\x02';
  var ETX = '\x03';
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
  function encode(name, message, namespace) {
    return prefix(name, namespace) + JSON.stringify(message) + ETX;
  }

  /**
   * @function decode
   * @param {string} name
   * @param {string} message
   * @param {string} namespace
   * @returns {string}
   */
  function decode(name, message, namespace) {
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
  function isLegal(name, message, namespace) {
    return message.indexOf(prefix(name, namespace)) === 0 && message.lastIndexOf(ETX) === message.length - 1;
  }

  /**
   * @module support
   * @license MIT
   * @version 2017/12/13
   */

  var documentElement = document.documentElement;

  var supportIEEvent = 'attachEvent' in documentElement;
  var supportW3CEvent = 'addEventListener' in documentElement;

  /**
   * @module messenger
   * @license MIT
   * @version 2017/12/07
   */

  /**
   * @class Messenger
   * @constructor
   * @param {string} name
   */
  function Messenger(name, namespace) {
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

  /**
   * @module worker
   * @license MIT
   * @version 2017/12/07
   */

  function Worker() {
    var worker = new Messenger('Worker', 'CORS');

    worker.add('Master', window.parent);

    worker.listen(function(data, origin) {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          worker.send('Master', { valid: true, uid: data.uid, data: xhr.responseText }, origin);
        }
      };

      xhr.onerror = function() {
        worker.send('Master', { valid: false, uid: data.uid, data: 'Request ' + data.url + ' failed' }, origin);
      };

      xhr.open('GET', data.url);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send();
    });

    worker.send('Master', 'ready', domain(document.referrer));
  }

  return Worker;

})));
