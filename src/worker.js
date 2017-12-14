/**
 * @module worker
 * @license MIT
 * @version 2017/12/07
 */

import { domain } from './utils';
import Messenger from './messenger/messenger';

export default function Worker() {
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
