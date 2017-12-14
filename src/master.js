/**
 * @module master
 * @license MIT
 * @version 2017/12/07
 */

import param from './param';
import domReady from './dom-ready';
import Messenger from './messenger/messenger';
import { uid, domain, typeOf } from './utils';

export default function Master(url) {
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
