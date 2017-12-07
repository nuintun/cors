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
  typeof define === 'function' && define.amd ? define('cors', factory) :
  (global.CORS = factory());
}(this, (function () { 'use strict';

  /**
   * @module worker
   * @license MIT
   * @version 2017/12/07
   */

  function Worker() {
    // Worker
  }

  /**
   * @module cors.worker
   * @license MIT
   * @version 2017/12/07
   */

  var cors_worker = { Worker: Worker };

  return cors_worker;

})));
