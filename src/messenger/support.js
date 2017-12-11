/**
 * @module support
 * @license MIT
 * @version 2017/12/11
 */

import { native } from '../utils';

// If support MessageChannel, ignore postMessage support
export var supportMessage = native(this.postMessage);
export var supportIEEvent = native(this.attachEvent);
export var supportW3CEvent = native(this.addEventListener);
