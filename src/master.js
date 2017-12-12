/**
 * @module master
 * @license MIT
 * @version 2017/12/07
 */

import Messenger from './messenger/messenger';

export default function Master(url) {
  this['<ready>'] = false;
  this.messenger = this.proxy(url);
}

Master.prototype = {
  ready: function(callback) {},
  proxy: function(url) {
    var iframe = document.createElement('iframe');

    iframe.setAttribute('width', '0');
    iframe.setAttribute('height', '0');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('marginwidth', '0');
    iframe.setAttribute('marginheight', '0');

    iframe.src = url;

    document.documentElement.appendChild(iframe);

    var messenger = new Messenger('master');

    messenger.add('worker', iframe.contentWindow);

    messenger.listen(function(message) {
      console.log(message);

      messenger.send('Master received', 'worker');
    });

    return messenger;
  },
  request: function(options) {}
};
