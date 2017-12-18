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
   * @module support
   * @license MIT
   * @version 2017/12/13
   */

  var documentElement = document.documentElement;

  var supportIEEvent = 'attachEvent' in documentElement;
  var supportW3CEvent = 'addEventListener' in documentElement;

  /**
   * @module dom-ready
   * @license MIT
   * @version 2017/12/13
   * @see https://github.com/jakobmattsson/onDomReady
   */

  var readyTimer;
  var isBound = false;
  var readyList = [];

  /**
   * @function whenReady
   */
  function whenReady() {
    // Make sure body exists, at least, in case IE gets a little overzealous.
    // This is taked directly from jQuery's implementation.
    if (!document.body) {
      clearTimeout(readyTimer);

      return (readyTimer = setTimeout(whenReady, 1));
    }

    for (var i = 0; i < readyList.length; i++) {
      readyList[i]();
    }

    readyList = [];
  }

  /**
   * @function DOMContentLoaded
   */
  function DOMContentLoaded() {
    document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);

    whenReady();
  }

  /**
   * @function onreadystatechange
   */
  function onreadystatechange() {
    if (document.readyState === 'complete') {
      document.detachEvent('onreadystatechange', onreadystatechange);

      whenReady();
    }
  }

  /**
   * @function doScrollCheck
   */
  function doScrollCheck() {
    // Stop searching if we have no functions to call
    // (or, in other words, if they have already been called)
    if (readyList.length > 0) {
      try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        document.documentElement.doScroll('left');
      } catch (error) {
        return setTimeout(doScrollCheck, 1);
      }

      // And execute any waiting functions
      whenReady();
    }
  }

  /**
   * @function bindReady
   */
  function bindReady() {
    // Mozilla, Opera and webkit nightlies currently support this event
    if (supportW3CEvent) {
      document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
      window.addEventListener('load', whenReady, false); // fallback
      // If IE event model is used
    } else if (supportIEEvent) {
      document.attachEvent('onreadystatechange', onreadystatechange);
      window.attachEvent('onload', whenReady); // fallback

      // If IE and not a frame, continually check to see if the document is ready
      var toplevel = false;

      try {
        toplevel = window.frameElement == null;
      } catch (error) {
        // Do nothing
      }

      // The DOM ready check for Internet Explorer
      if (document.documentElement.doScroll && toplevel) {
        doScrollCheck();
      }
    }
  }

  /**
   * @function domReady
   * @param {Function} callback
   */
  function domReady(callback) {
    // Push the given callback onto the list of functions to execute when ready.
    // If the dom has alredy loaded, call 'whenReady' right away.
    // Otherwise bind the ready-event if it hasn't been done already
    readyList.push(callback);

    if (document.readyState === 'complete') {
      whenReady();
    } else if (!isBound) {
      bindReady();

      isBound = true;
    }
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
   * @module utils
   * @license MIT
   * @version 2017/12/07
   */

  var UID = 0;

  /**
   * @function uid
   * @returns {string}
   */
  function uid() {
    return 'UID-' + UID++;
  }

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
   * @module master
   * @license MIT
   * @version 2017/12/07
   */

  /**
   * @class Master
   * @constructor
   * @param {string} url
   */
  function Master(url) {
    url = String(url);

    this['<ready>'] = false;
    this['<origin>'] = domain(url);
    this['<callbacks>'] = { ready: [] };
    this['<messenger>'] = this['<proxy>'](url);
  }

  Master.prototype = {
    /**
     * @private
     * @method <onready>
     * @param {Function} callback
     */
    '<onready>': function(callback) {
      var callbacks = this['<callbacks>'];

      if (this['<ready>']) {
        callback();
      } else {
        callbacks.ready.push(callback);
      }
    },

    /**
     * @private
     * @method <proxy>
     * @param {string} url
     * @returns {Messenger}
     */
    '<proxy>': function(url) {
      var iframe = document.createElement('iframe');

      iframe.setAttribute('width', '0');
      iframe.setAttribute('height', '0');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('marginwidth', '0');
      iframe.setAttribute('marginheight', '0');

      iframe.style.display = 'none';

      iframe.src = url;

      var self = this;
      var origin = self['<origin>'];
      var callbacks = self['<callbacks>'];
      var messenger = new Messenger('Master', 'CORS');

      // On DOM ready
      domReady(function() {
        // Append to DOM tree
        document.body.appendChild(iframe);

        // Add source
        messenger.add('Worker', iframe.contentWindow);

        // Add listener
        messenger.onmessage(function(response) {
          if (response.origin === origin) {
            var data = response.data;

            if (data === 'ready') {
              if (!self['<ready>']) {
                self['<ready>'] = true;

                var ready = callbacks.ready;

                for (var i = 0, length = ready.length; i < length; i++) {
                  ready[i]();
                }

                delete callbacks.ready;
              }
            } else if (typeOf(data) === 'object') {
              var id = data.uid;

              if (callbacks[id]) {
                callbacks[id](data);

                delete callbacks[id];
              }
            }
          }
        });
      });

      return messenger;
    },

    /**
     * @public
     * @method request
     * @param {string} url
     * @param {Object} options
     * @returns {Promise}
     */
    request: function(url, options) {
      var self = this;
      var origin = self['<origin>'];
      var callbacks = self['<callbacks>'];
      var messenger = self['<messenger>'];

      return new Promise(function(resolve, reject) {
        var id = uid();

        callbacks[id] = function(response) {
          if (response.valid) {
            resolve(response.data);
          } else {
            reject(response.data);
          }
        };

        self['<onready>'](function() {
          messenger.send('Worker', { uid: id, url: url, options: options }, origin);
        });
      });
    }
  };

  return Master;

})));
