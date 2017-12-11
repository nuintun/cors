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
   * @param {string} namespace
   * @returns {string}
   */


  /**
   * @function decode
   * @param {string} name
   * @param {string} message
   * @param {string} namespace
   * @returns {string}
   */


  /**
   * @function isLegal
   * @param {string} name
   * @param {string} message
   * @param {string} namespace
   * @returns {boolean}
   */


  /**
   * @function fallback
   * @param {string} name
   * @param {Function} callback
   * @param {string} namespace
   * @returns {Function}
   */

  /**
   * @module support
   * @license MIT
   * @version 2017/12/11
   */

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
