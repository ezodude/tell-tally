'use strict';

const _          = require('lodash')
    , csv        = require('fast-csv')
    , h          = require('highland')
    , providers  = require('./providers')
    , moment     = require('moment')
    , money      = require("money-math");

module.exports = Tally;

function Tally(opts) {
  if (!(this instanceof Tally)) return new Tally(opts);
  opts = opts || {};
  this.dictionary = opts.dictionary;
  this.fromDate = opts.fromDate;
  this.provider = providers[opts.provider] || providers.default;
  this.calculations = [];
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
  if(this.fromDate){ this.transactions = this.transactions.reject( t => moment(t.date).isBefore(this.fromDate) ); }
};

Tally.prototype.calculate = function (expense) {
  const pattern = _.values(this.dictionary.get(_.snakeCase(expense))).join('|');
  const regex = new RegExp(pattern, 'i');
  const calculation = this.transactions.fork().filter(t => regex.test(t.source)).doto(t => t.expense = expense).collect();
  this.calculations.push(calculation);
};

Tally.prototype.tally = function (cb) {
  const result = {};

  h(this.calculations)
  .merge()
  .reject(group => group.length === 0)
  .each(group => {
    result[group[0].expense] = _.reduce(group, (sum, n) => money.add(sum, n.value), money.centsToAmount('0'));
  })
  .stopOnError(e => cb(e, null))
  .done( __ => {
    result.total = _.reduce(_.values(result), (sum, n) => money.add(sum, n), money.centsToAmount('0'));
    cb(null, result);
  });

  return this;
};