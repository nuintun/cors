/**
 * @module cors
 * @author nuintun
 * @license MIT
 * @version 0.0.1
 * @description A pure JavaScript CORS framework.
 * @see https://nuintun.github.io/cors#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('cors-worker', factory) :
  (global = global || self, global.CORSWorker = factory());
}(this, function () { 'use strict';

  /**
   * @module utils
   * @license MIT
   * @version 2017/12/07
   */

  var toString = Object.prototype.toString;

  /**
   * @function typeOf
   * @param {any} value
   * @returns {string}
   */
  function typeOf(value) {
    if (value === null) return 'null';

    if (value === void 0) return 'undefined';

    return toString
      .call(value)
      .slice(8, -1)
      .toLowerCase();
  }

  /**
   * @function isArray
   * @param {any} value
   * @returns {boolean}
   */
  var isArray = Array.isArray
    ? function(value) {
        return Array.isArray(value);
      }
    : function(value) {
        return typeOf(value) === 'array';
      };

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
   * @module param
   * @license MIT
   * @version 2017/12/14
   */

  /**
   * @function buildParams
   * @param {string} prefix
   * @param {any} object
   * @param {Function} add
   */
  function buildParams(prefix, object, add) {
    if (isArray(object)) {
      var value;

      // Serialize array item
      for (var i = 0, length = object.length; i < length; i++) {
        value = object[i];

        // Item is non-scalar (array or object), encode its numeric index
        buildParams(prefix + '[' + (typeOf(value) === 'object' && value != null ? i : '') + ']', value, add);
      }
    } else if (typeOf(object) === 'object') {
      // Serialize object item
      for (var name in object) {
        buildParams(prefix + '[' + name + ']', object[name], add);
      }
    } else {
      // Serialize scalar item
      add(prefix, object);
    }
  }

  /**
   * @function param
   * @description Serialize an array or a set of key/values into a query string
   * @param {Array|Object} object
   * @returns {string}
   * @see https://github.com/jquery/jquery/blob/master/src/serialize.js
   */
  function param(object) {
    var params = [];

    function add(key, value) {
      // If value is a function, invoke it and use its return value
      value = typeof value === 'function' ? value() : value;

      params[params.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value == null ? '' : value);
    }

    // If an array was passed in, assume that it is an array of key/values
    if (isArray(object)) {
      var item;

      for (var i = 0, length = object.length; i < length; i++) {
        item = object[i];

        add(item.name, item.value);
      }
    } else if (typeOf(object) === 'object') {
      // Encode params recursively
      for (var prefix in object) {
        buildParams(prefix, object[prefix], add);
      }
    } else {
      return String(object);
    }

    // Return the resulting serialization
    return params.join('&');
  }

  /**
   * @module fetch
   * @license MIT
   * @version 2017/12/14
   */

  var nonce = 0;
  var QUERY_RE = /\?/;
  // ASCII PU1 use for no cache key
  var PU1 = encodeURIComponent('\x91');

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  /**
   * @function normalizeMethod
   * @param {string} method
   * @returns {string}
   */
  function normalizeMethod(method) {
    method = String(method);

    var upcased = method.toUpperCase();

    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  /**
   * @function cleanXHR
   * @param {XMLHttpRequest} xhr
   */
  function cleanXHR(xhr) {
    xhr.onreadystatechange = null;
    xhr.onerror = null;
    xhr.ontimeout = null;
    xhr.onabort = null;
  }

  /**
   * @function fetch
   * @param {string} url
   * @param {Object} options
   * @returns {Promise}
   */
  function fetch(url, options) {
    options = options || {};
    options.cache = options.cache !== false;
    options.headers = options.headers || {};
    options.data = options.hasOwnProperty('data') ? param(options.data) : null;
    options.method = options.hasOwnProperty('method') ? normalizeMethod(options.method) : 'GET';

    if (options.method === 'GET') {
      if (options.data !== null) {
        url += QUERY_RE.test(url) ? '&' + options.data : '?' + options.data;
      }

      if (options.cache) {
        url += (QUERY_RE.test(url) ? '&' : '?') + PU1 + '=' + (+new Date() + nonce++);
      }
    }

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          cleanXHR(xhr);
          resolve(xhr);
        }
      };

      /**
       * @function rejectError
       * @param {string} message
       */
      function rejectError(message) {
        reject(new TypeError('Request ' + url + ' ' + message));
      }

      xhr.ontimeout = function() {
        cleanXHR(xhr);
        rejectError('timeout');
      };

      xhr.onabort = function() {
        cleanXHR(xhr);
        rejectError('aborted');
      };

      xhr.onerror = function() {
        cleanXHR(xhr);
        rejectError('failed');
      };

      xhr.open(options.method, url, true, options.username, options.password);

      var headers = options.headers;

      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, String(headers[key]));
        }
      }

      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      if (options.method === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      }

      xhr.send(options.method === 'POST' ? options.data : null);
    });
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

  /**
   * @class Worker
   * @constructor
   */
  function Worker() {
    this['<init>']();
  }

  /**
   * @private
   * @method <init>
   */
  Worker.prototype['<init>'] = function() {
    var worker = new Messenger('Worker', 'CORS');

    worker.add('Master', window.parent);

    worker.onmessage(function(response) {
      var data = response.data;
      var origin = response.origin;
      var source = response.source;

      fetch(data.url, data.options)
        .then(function(response) {
          worker.send(source, { valid: true, uid: data.uid, data: response.responseText }, origin);
        })
        .catch(function(error) {
          worker.send(source, { valid: false, uid: data.uid, data: error.stack || error.message }, origin);
        });
    });

    worker.send('Master', 'ready', domain(document.referrer));
  };

  return Worker;

}));
