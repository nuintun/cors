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

  /**
   * @function uid
   * @returns {string}
   */


  /**
   * @function typeOf
   * @param {any} value
   * @returns {string}
   */


  /**
   * @function isArray
   * @param {any} value
   * @returns {boolean}
   */


  var DOMAIN_RE = /^([a-z0-9.+-]+:)?\/\/(?:[^/:]*(?::[^/]*)?@)?([^/]+)/i;

  /**
   * @function domain
   * @param {string} url
   * @returns {string}
   */
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
   * @module support
   * @license MIT
   * @version 2017/12/13
   */

  var documentElement = document.documentElement;

  var supportIEEvent = 'attachEvent' in documentElement;
  var supportW3CEvent = 'addEventListener' in documentElement;

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
  function isLegalMessage(name, message, namespace) {
    return message.indexOf(prefix(name, namespace)) === 0 && message.lastIndexOf(ETX) === message.length - 1;
  }

  /**
   * @function findSourceName
   * @param {window} source
   * @param {Object} targets
   * @returns {string|null}
   */
  function findSourceName(source, targets) {
    for (var name in targets) {
      if (targets.hasOwnProperty(name) && targets[name] === source) {
        return name;
      }
    }

    return null;
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
  function Messenger(name, namespace) {
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

  /**
   * @module worker
   * @license MIT
   * @version 2017/12/07
   */

  function Worker() {
    var worker = new Messenger('Worker', 'CORS');

    worker.add('Master', window.parent);

    worker.onmessage(function(response) {
      var data = response.data;
      var origin = response.origin;
      var source = response.source;
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          worker.send(source, { valid: true, uid: data.uid, data: xhr.responseText }, origin);
        }
      };

      xhr.onerror = function() {
        worker.send(source, { valid: false, uid: data.uid, data: 'Request ' + data.url + ' failed' }, origin);
      };

      xhr.open('GET', data.url);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send();
    });

    worker.send('Master', 'ready', domain(document.referrer));
  }

  return Worker;

})));
