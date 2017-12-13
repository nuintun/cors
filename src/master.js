/**
 * @module master
 * @license MIT
 * @version 2017/12/07
 */

import { uid } from './utils';
import Messenger from './messenger/messenger';

export default function Master(url) {
  this['<ready>'] = false;
  this['<callbacks>'] = { ready: [] };
  this['<messenger>'] = this['<proxy>'](url);
}

Master.prototype = {
  ready: function(callback) {
    var callbacks = this['<callbacks>'];

    if (this['<ready>']) {
      callback();
    } else {
      callbacks.ready.push(callback);
    }
  },
  '<proxy>': function(url) {
    var iframe = document.createElement('iframe');

    iframe.setAttribute('width', '0');
    iframe.setAttribute('height', '0');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('marginwidth', '0');
    iframe.setAttribute('marginheight', '0');

    iframe.src = url;

    document.documentElement.appendChild(iframe);

    var self = this;
    var callbacks = this['<callbacks>'];
    var messenger = new Messenger('Master');

    messenger.add('Worker', iframe.contentWindow);

    messenger.listen(function(response) {
      if (response === 'ready') {
        if (!self['<ready>']) {
          self['<ready>'] = true;

          var ready = callbacks.ready;

          for (var i = 0, length = ready.length; i < length; i++) {
            ready[i]();
          }

          delete callbacks.ready;
        }
      } else {
        try {
          response = JSON.parse(response);
        } catch (error) {
          // Unknow error
          return console && console.error && console.error(response);
        }

        var id = response.uid;

        if (callbacks[id]) {
          callbacks[id](response);

          delete callbacks[id];
        }
      }
    });

    return messenger;
  },
  request: function(url, options) {
    var callbacks = this['<callbacks>'];
    var messenger = this['<messenger>'];

    return new Promise(function(resolve, reject) {
      var id = uid();

      callbacks[id] = function(response) {
        if (response.valid) {
          resolve(response.data);
        } else {
          reject(response.data);
        }
      };

      messenger.send(
        JSON.stringify({
          uid: id,
          url: url,
          options: options
        }),
        'Worker'
      );
    });
  }
};
