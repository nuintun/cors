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
  function Target(name, target, origin, namespace) {
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

  /**
   * @module support
   * @license MIT
   * @version 2017/12/13
   */

  var supportIEEvent = 'attachEvent' in window;
  var supportW3CEvent = 'addEventListener' in window;

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

  /**
   * @module worker
   * @license MIT
   * @version 2017/12/07
   */

  function Worker() {
    var worker = new Messenger('Worker');

    worker.add('Master', window.parent, document.referrer);

    worker.listen(function(message, origin) {
      var data = JSON.parse(message);

      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          worker.send(
            JSON.stringify({
              valid: true,
              uid: data.uid,
              data: xhr.responseText
            }),
            'Master',
            origin
          );
        }
      };

      xhr.open('GET', data.url);
      xhr.send();
    });

    worker.send('ready', 'Master', domain(document.referrer));
  }

  return Worker;

})));
