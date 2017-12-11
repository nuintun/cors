/**
 * @module support
 * @license MIT
 * @version 2017/12/11
 */

export var supportMessage = 'postMessage' in this;
export var supportIEEvent = 'attachEvent' in this;
export var supportW3CEvent = 'addEventListener' in this;
