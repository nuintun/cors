/**
 * @module utils
 * @license MIT
 * @version 2017/12/07
 */

var UID = 0;

export function uid() {
  return 'UID-' + UID++;
}

var toString = Object.prototype.toString;

export function typeOf(value) {
  if (value === null) return 'null';

  if (value === void 0) return 'undefined';

  return toString
    .call(value)
    .slice(8, -1)
    .toLowerCase();
}
