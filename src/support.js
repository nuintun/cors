/**
 * @module support
 * @license MIT
 * @version 2017/12/13
 */

var documentElement = document.documentElement;

export var supportIEEvent = 'attachEvent' in documentElement;
export var supportW3CEvent = 'addEventListener' in documentElement;
