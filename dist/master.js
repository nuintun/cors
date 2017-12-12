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
  typeof define === 'function' && define.amd ? define('cors-master', factory) :
  (global.CORSMaster = factory());
}(this, (function () { 'use strict';

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
  function encode(name, message, namespace) {
    return prefix(name, namespace) + message + ETX;
  }

  /**
   * @function decode
   * @param {string} name
   * @param {string} message
   * @param {string} namespace
   * @returns {string}
   */
  function decode(name, message, namespace) {
    return message.slice(prefix(name, namespace).length, -1);
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
   * @function fallback
   * @param {string} name
   * @param {Function} callback
   * @param {string} namespace
   * @returns {Function}
   */
  function fallback(name, callback, namespace) {
    name = ACK + '-' + namespace + '-' + name;

    if (typeof callback === 'function') {
      window.navigator[name] = callback;
    }

    return window.navigator[name];
  }

  /**
   * @module support
   * @license MIT
   * @version 2017/12/11
   */

  var supportMessage = 'postMessage' in window;
  var supportIEEvent = 'attachEvent' in window;
  var supportW3CEvent = 'addEventListener' in window;

  /**
   * @module target
   * @license MIT
   * @version 2017/12/11
   */

  /**
   * @class Target
   * @constructor
   * @param {string} name
   * @param {window} target
   * @param {string} namespace
   * @param {prefix}
   */
  function Target(name, target, namespace) {
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
  function Messenger$1(name, namespace) {
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
  Messenger$1.prototype.init = function() {
    var name = this.name;
    var namespace = this.namespace;
    var listens = this.listens;

    function callback(message) {
      if (typeof message === 'object' && message.data) {
        message = message.data;
      }

      if (isLegal(name, message, namespace)) {
        message = decode(name, message, namespace);

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
      fallback(name, callback, namespace);
    }
  };

  /**
   * @public
   * @method add
   * @description Add a target
   * @param {window|iframe} target
   */
  Messenger$1.prototype.add = function(name, target) {
    this.targets[name] = new Target(name, target, this.namespace);
  };

  /**
   * @public
   * @method listen
   * @param {Function} callback
   */
  Messenger$1.prototype.listen = function(callback) {
    this.listens.push(callback);
  };

  /**
   * @public
   * @method clear
   */
  Messenger$1.prototype.clear = function() {
    this.listens = [];
  };

  /**
   * @public
   * @method send
   * @param {string} message
   */
  Messenger$1.prototype.send = function(message, target) {
    var targets = this.targets;

    if (arguments.length > 1) {
      target = String(target);

      if (targets.hasOwnProperty(target)) {
        targets[target].send(message);
      }
    } else {
      for (var name in targets) {
        if (targets.hasOwnProperty(name)) {
          targets[name].send(message);
        }
      }
    }
  };

  /**
   * @module master
   * @license MIT
   * @version 2017/12/07
   */

  window.Messenger = Messenger$1;

  return Messenger$1;

})));
