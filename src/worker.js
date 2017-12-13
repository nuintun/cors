/**
 * @module worker
 * @license MIT
 * @version 2017/12/07
 */

import { domain } from './utils';
import Messenger from './messenger/messenger';

export default function Worker() {
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
