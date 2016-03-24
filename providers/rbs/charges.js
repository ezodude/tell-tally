'use strict';

const h = require('highland')
    , _ = require('lodash');

const RBS_CHARGE_TYPES = ['DPC', 'POS', 'S/O', 'D/D'];

const transforms = {
  baseline(c) {
    const source = c[2].split(',')[1];
    return {
      date: c[0].trim(),
      type: c[1].trim(),
      source: _.isString(source) ? source.toLowerCase().trim() : null,
      value: Number.parseFloat(c[3], 10)
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