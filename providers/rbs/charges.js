'use strict';

const h       = require('highland')
    , _       = require('lodash')
    , moment  = require('moment')
    , money   = require("money-math");

const RBS_CHARGE_TYPES = ['DPC', 'POS', 'S/O', 'D/D'];

const transforms = {
  baseline(c) {
    const source = c[2].split(',')[1];
    const value = Number.parseFloat(c[3], 10);
    const normalised = money.floatToAmount(value < 0 ? (-1 * value) : value);

    return {
      date: moment.utc(c[0].trim(), "DD-MM-YYYY").toISOString(),
      type: c[1].trim(),
      source: _.isString(source) ? source.toLowerCase().trim() : null,
      value: normalised
    }
  },

  chargesOnly(c) {
    return _.includes(RBS_CHARGE_TYPES, c.type)
  }
};

module.exports = h.pipeline(
  h.map(transforms.baseline),
  h.filter(transforms.chargesOnly)
);

module.exports.transforms = transforms;