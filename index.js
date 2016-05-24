'use strict';

const _          = require('lodash')
    , h          = require('highland')
    , moment     = require('moment')
    , money      = require("money-math");

module.exports = Tally;

function Tally(charges, opts) {
  if (!(this instanceof Tally)) return new Tally(charges, opts);
  opts = opts || {};
  this.dictionary = opts.dictionary;
  this.fromDate = opts.fromDate;
  this.calculations = [];

  this.charges = (h.isStream(charges) ? charges : h( charges ));
  if(this.fromDate){ this.charges = this.charges.reject( t => moment(t.date).isBefore(this.fromDate) ); }
}

Tally.prototype.calculate = function (expense) {
  const pattern = _.values(this.dictionary.get(_.snakeCase(expense))).join('|');
  const regex = new RegExp(pattern, 'i');
  const calculation = this.charges.fork().filter(t => regex.test(t.source)).doto(t => t.expense = expense).collect();
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