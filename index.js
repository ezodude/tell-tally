'use strict';

module.exports = Tally;

function Tally(file, opts) {
  if (!(this instanceof Tally)) return new Tally(file, opts);
  opts = opts || {};
  this.filePath = file;
  this.dictionary = opts.dictionary;
  this.startDate = opts.startDate;
  this.provider = opts.provider;
}

Tally.prototype.calculate = function (expense) {
  console.log('CALCULATE', expense);
};

Tally.prototype.tally = function () {
  console.log('THE TALLY');
};