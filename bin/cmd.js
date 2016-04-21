#! /usr/bin/env node

'use strict';

const csv           = require('fast-csv')
    , program       = require('commander')
    , config        = require('config')
    , chalk         = require('chalk')
    , h             = require('highland')
    , chargeStream  = require('./../providers/rbs').chargeStream;

const add = function (a, b) {
  return a + (b.value * -1);
};

program
.usage('[options] <transactions.csv>')
.description('Calculate your spending from a transactions or statement csv.')
.arguments('<file>')
.option('-s, --start-date <ISODate>', 'Calculation start date.')
.option('-h, --household', 'Calculate household expenses.')
.option('-e, --eating-out', 'Calculate household expenses.')
.option('-c, --coffee-out', 'Calculate coffee out expenses.')
.option('-t, --transport', 'Calculate transport expenses.')
.action(file => {
  const base = csv.fromPath(file, {
    objectMode: true,
    headers: true,
    discardUnmappedColumns: true ,
    ignoreEmpty: true,
    trim: true
  });

  h(base)
  .through(chargeStream)
  .reduce(0, add)
  .doto(console.log)
  // .collect()
  .stopOnError( console.log )
  .each((rows) => { console.log('READING DONE!') });

  console.log(chalk.inverse.blue(">|>| YOUR TALLY |<|<"));
  console.log(chalk.bold.magenta("Start date    :" + "2016-02-28T00:00:00Z"));
  console.log(chalk.green("Household     :" + "£200.00"));
  console.log(chalk.green("Coffee        :" + "£30.00"));
  console.log(chalk.green("Transport     :" + "£25.00"));
  console.log(chalk.green("Config (prufrock )     :" + config.get('coffee_out.prufrock_coffee_limited')));
})
.parse(process.argv);

if (!program.args.length) program.help();