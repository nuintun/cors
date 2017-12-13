/**
 * @module master
 * @license MIT
 * @version 2017/12/07
 * @see https://github.com/jakobmattsson/onDomReady
 */

var readyTimer;
var isBound = false;
var readyList = [];

function whenReady() {
  // Make sure body exists, at least, in case IE gets a little overzealous.
  // This is taked directly from jQuery's implementation.
  if (!document.body) {
    clearTimeout(readyTimer);

    return (readyTimer = setTimeout(whenReady));
  }

  for (var i = 0; i < readyList.length; i++) {
    readyList[i]();
  }

  readyList = [];
}

function DOMContentLoaded() {
  document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);

  whenReady();
}

function onreadystatechange() {
  if (document.readyState === 'complete') {
    document.detachEvent('onreadystatechange', onreadystatechange);

    whenReady();
  }
}

function doScrollCheck() {
  // stop searching if we have no functions to call
  // (or, in other words, if they have already been called)
  if (readyList.length > 0) {
    try {
      // If IE is used, use the trick by Diego Perini
      // http://javascript.nwbox.com/IEContentLoaded/
      document.documentElement.doScroll('left');
    } catch (error) {
      return setTimeout(doScrollCheck, 1);
    }

    // and execute any waiting functions
    whenReady();
  }
}

function bindReady() {
  // Mozilla, Opera and webkit nightlies currently support this event
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
    window.addEventListener('load', whenReady, false); // fallback
    // If IE event model is used
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', onreadystatechange);
    window.attachEvent('onload', whenReady); // fallback

    // If IE and not a frame, continually check to see if the document is ready
    var toplevel = false;

    try {
      toplevel = window.frameElement == null;
    } catch (error) {
      // Do nothing
    }

    // The DOM ready check for Internet Explorer
    if (document.documentElement.doScroll && toplevel) {
      doScrollCheck();
    }
  }
}

export default function(callback) {
  // Push the given callback onto the list of functions to execute when ready.
  // If the dom has alredy loaded, call 'whenReady' right away.
  // Otherwise bind the ready-event if it hasn't been done already
  readyList.push(callback);

  if (document.readyState === 'complete') {
    whenReady();
  } else if (!isBound) {
    bindReady();

    isBound = true;
  }
}
