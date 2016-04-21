'use strict';

module.exports = Tally;

function Tally(file, opts) {
  if (!(this instanceof Tally)) return new Tally(file, opts);
  opts = opts || {};
  this.startDate = opts.startDate;
}
