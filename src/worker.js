/**
 * @module worker
 * @license MIT
 * @version 2017/12/07
 */

import Messenger from './messenger/messenger';

export default function Worker() {
  var worker = new Messenger('Worker');

  worker.add('Master', window.parent);

  worker.listen(function(response) {
    response = JSON.parse(response);

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        worker.send(
          JSON.stringify({
            valid: true,
            uid: response.uid,
            data: xhr.responseText
          }),
          'Master'
        );
      }
    };

    xhr.open('GET', response.url);
    xhr.send();
  });

  worker.send('ready', 'Master');
}
