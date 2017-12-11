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
   * @function encode
   * @param {string} name
   * @param {string} message
   * @returns {string}
   */
  function encode(name, message) {
    return SOH + name + STX + message + ETX;
  }

  /**
   * @function decode
   * @param {string} name
   * @param {string} message
   * @returns {string}
   */
  function decode(name, message) {
    var prefix = SOH + name + STX;

    return message.slice(prefix.length, -1);
  }

  /**
   * @function isLegal
   * @param {string} name
   * @param {string} message
   * @returns {boolean}
   */
  function isLegal(name, message) {
    var prefix = SOH + name + STX;

    return message.indexOf(prefix) === 0 && message.indexOf(ETX) === message.length - 1;
  }

  /**
   * @function fallback
   * @param {string} name
   * @param {Function} callback
   * @returns {Function}
   */
  function fallback(name, callback) {
    name = ACK + '-Target-' + name;

    if (typeof callback === 'function') {
      window.navigator[name] = callback;
    }

    return window.navigator[name];
  }

  /**
   * @module utils
   * @license MIT
   * @version 2017/12/07
   */

  // Used to match `RegExp`
  // [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
  var REGEXP_CHAR_RE = /[\\^$.*+?()[\]{}|]/g;
  // Used to detect if a method is native
  var IS_NATIVE_RE = Function.prototype.toString.call(Function);

  IS_NATIVE_RE = IS_NATIVE_RE.replace(REGEXP_CHAR_RE, '\\$&');
  IS_NATIVE_RE = IS_NATIVE_RE.replace(/Function|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?');
  IS_NATIVE_RE = new RegExp('^' + IS_NATIVE_RE + '$');

  /**
   * @function native
   * @param {any} value
   * @returns {boolean}
   */
  function native(value) {
    return typeof value === 'function' && IS_NATIVE_RE.test(value);
  }

  /**
   * @module support
   * @license MIT
   * @version 2017/12/11
   */

  // If support MessageChannel, ignore postMessage support
  var supportMessage = native(window.postMessage);
  var supportIEEvent = native(window.attachEvent);
  var supportW3CEvent = native(window.addEventListener);

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
   * @param {prefix}
   */
  function Target(name, target) {
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
  function Messenger$1(name) {
    this.name = String(name);

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
  Messenger$1.prototype.add = function(name, target) {
    this.targets[name] = new Target(name, target);
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
  Messenger$1.prototype.send = function(message) {
    var targets = this.targets;

    for (var name in targets) {
      if (targets.hasOwnProperty(name)) {
        targets[name].send(message);
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
