(function() {
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }

    return number;
  }

  if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
      return (
        this.getUTCFullYear() +
        '-' +
        pad(this.getUTCMonth() + 1) +
        '-' +
        pad(this.getUTCDate()) +
        'T' +
        pad(this.getUTCHours()) +
        ':' +
        pad(this.getUTCMinutes()) +
        ':' +
        pad(this.getUTCSeconds()) +
        '.' +
        (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z'
      );
    };
  }

  var index = 1;
  var locked = false;
  var url = '//127.0.0.1:8080/package.json';
  var output = document.getElementById('output');
  var cors = new CORSMaster('//127.0.0.1:8080/examples/api.html');

  function send() {
    if (locked) {
      return console.warn('Already have a fetch, please wait for the previous completion.');
    }

    locked = true;

    var bookmark = 'CORS-' + index++;

    console.time(bookmark);

    var result = cors.request(url);

    output.innerText = '⚡ Loading...';

    result
      .then(function(json) {
        json = JSON.parse(json);

        console.log('Got json:', json);
        console.timeEnd(bookmark);

        output.innerText =
          '🌏 URL: ' +
          location.protocol +
          url +
          '\n' +
          '🕗 Time: ' +
          new Date().toISOString() +
          '\n' +
          '🔊 Response: ' +
          JSON.stringify(json, null, 2);

        locked = false;
      })
      ['catch'](function(error) {
        console.error('Failed:', error);
        console.timeEnd(bookmark);

        locked = false;
      });
  }

  document.getElementById('cors').onclick = send;
})();
