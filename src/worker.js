/**
 * @module worker
 * @license MIT
 * @version 2017/12/07
 */

import fetch from './fetch';
import { domain } from './utils';
import Messenger from './messenger/messenger';

/**
 * @class Worker
 * @constructor
 */
export default function Worker() {
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
