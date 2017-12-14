/**
 * @module worker
 * @license MIT
 * @version 2017/12/07
 */

import { domain } from './utils';
import Messenger from './messenger/messenger';

export default function Worker() {
  var worker = new Messenger('Worker', 'CORS');

  worker.add('Master', window.parent, document.referrer);

  worker.listen(function(data, origin) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        worker.send('Master', { valid: true, uid: data.uid, data: xhr.responseText }, origin);
      }
    };

    xhr.onerror = function() {
      worker.send('Master', { valid: false, uid: data.uid, data: 'Request ' + data.url + ' failed' }, origin);
    };

    xhr.open('GET', data.url);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
  });

  worker.send('Master', 'ready', domain(document.referrer));
}
