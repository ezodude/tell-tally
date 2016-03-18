#! /usr/bin/env node

'use strict';

const csv     = require('fast-csv')
    , program = require('commander')
    , config  = require('config')
    , chalk   = require('chalk')
    , h       = require('highland')
    , _       = require('lodash');

const RBS_CHARGE_TYPES = ['DPC', 'POS', 'S/O', 'D/D'];

program
.usage('[options] <file>')
.arguments('<file>')
.option('-s, --start-date <ISODate>', 'Tally start date.')
.option('-h, --household', 'Will tally household expenses.')
.option('-e, --eating-out', 'Will tally household expenses.')
.option('-c, --coffee-out', 'Will tally coffee out expenses.')
.option('-t, --transport', 'Will tally transport expenses.')
.action(file => {
  const base = csv.fromPath(file, {
    objectMode: true,
    headers: true,
    discardUnmappedColumns: true ,
    ignoreEmpty: true,
    trim: true
  });

  h(base)
  .map(row => {
    const description = row[2].split(',')[1];
    return {
      date: row[0].trim(),
      type: row[1].trim(),
      description: _.isString(description) ? description.toLowerCase().trim() : null,
      value: Number.parseFloat(row[3], 10)
    }
  })
  .filter(row => _.includes(RBS_CHARGE_TYPES, row.type))
  .doto(console.log)
  .collect()
  .each((rows) => { console.log('READING DONE!') });

  console.log(chalk.inverse.blue(">|>| YOUR TALLY |<|<"));
  console.log(chalk.bold.magenta("Start date    :" + "2016-02-28T00:00:00Z"));
  console.log(chalk.green("Household     :" + "£200.00"));
  console.log(chalk.green("Coffee        :" + "£30.00"));
  console.log(chalk.green("Transport     :" + "£25.00"));
  console.log(chalk.green("Config (prufrock )     :" + config.get('coffee_out.prufrock_coffee_limited')));
})
.parse(process.argv);