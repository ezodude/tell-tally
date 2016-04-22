'use strict';

const csv           = require('fast-csv')
    , h             = require('highland')
    , providers  = require('./providers');

module.exports = Tally;

function Tally(opts) {
  if (!(this instanceof Tally)) return new Tally(opts);
  opts = opts || {};
  this.dictionary = opts.dictionary;
  this.startDate = opts.startDate;
  this.provider = providers[opts.provider] || providers.default;
}

Tally.prototype.transactionsFrom = function (file) {
  const stream = csv.fromPath(file, {
    objectMode: true,
    headers: true,
    discardUnmappedColumns: true ,
    ignoreEmpty: true,
    trim: true
  });
  this.transactions = h(stream).through(this.provider);
};

Tally.prototype.calculate = function (expense) {
  console.log('CALCULATE', expense);
};

Tally.prototype.tally = function () {
  this.transactions
  .doto(console.log)
  .each(_ => {});
};