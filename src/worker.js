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

    worker.send(
      JSON.stringify({
        valid: true,
        uid: response.uid,
        data: { username: 'nuintun' }
      }),
      'Master'
    );
  });

  worker.send('ready', 'Master');
}
