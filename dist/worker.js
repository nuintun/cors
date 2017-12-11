/**
* @module cors
* @author nuintun
* @license MIT
* @version 0.0.1
* @description A pure JavaScript CORS framework.
* @see https://nuintun.github.io/cors
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('cors-worker', factory) :
  (global.CORSWorker = factory());
}(this, (function () { 'use strict';

  /**
   * @module utils
   * @license MIT
   * @version 2017/12/11
   */

  /**
   * @function encode
   * @param {string} name
   * @param {string} message
   * @returns {string}
   */


  /**
   * @function decode
   * @param {string} name
   * @param {string} message
   * @returns {string}
   */


  /**
   * @function isLegal
   * @param {string} name
   * @param {string} message
   * @returns {boolean}
   */


  /**
   * @function fallback
   * @param {string} name
   * @param {Function} callback
   * @returns {Function}
   */

  /**
   * @module utils
   * @license MIT
   * @version 2017/12/07
   */

  // Used to match `RegExp`
  // [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
  var REGEXP_CHAR_RE = /[\\^$.*+?()[\]{}|]/g;
  // Used to detect if a method is native
  var IS_NATIVE_RE = Function.prototype.toString.call(Function);

  IS_NATIVE_RE = IS_NATIVE_RE.replace(REGEXP_CHAR_RE, '\\$&');
  IS_NATIVE_RE = IS_NATIVE_RE.replace(/Function|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?');
  IS_NATIVE_RE = new RegExp('^' + IS_NATIVE_RE + '$');

  /**
   * @function native
   * @param {any} value
   * @returns {boolean}
   */

  /**
   * @module support
   * @license MIT
   * @version 2017/12/11
   */

  // If support MessageChannel, ignore postMessage support

  /**
   * @module target
   * @license MIT
   * @version 2017/12/11
   */

  /**
   * @module messenger
   * @license MIT
   * @version 2017/12/07
   */

  /**
   * @module worker
   * @license MIT
   * @version 2017/12/07
   */

  window.Messenger = Messenger;

  return Messenger;

})));
