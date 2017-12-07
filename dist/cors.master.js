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
   * @module master
   * @license MIT
   * @version 2017/12/07
   */

  function Master() {
    // Master
  }

  /**
   * @module cors.master
   * @license MIT
   * @version 2017/12/07
   */

  var cors_master = { Master: Master };

  return cors_master;

})));
