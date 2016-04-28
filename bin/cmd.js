#! /usr/bin/env node

'use strict';

const _             = require('lodash')
    , csv           = require('fast-csv')
    , program       = require('commander')
    , config        = require('config')
    , chalk         = require('chalk')
    , h             = require('highland')
    , chargeStream  = require('./../providers/rbs').chargeStream
    , telltally     = require('../');

program
.usage('[options] <transactions.csv> <provider>')
.description('Calculate your spending from a transactions or statement csv.\n\n' + '  Provider options:\n\n  * rbs: Royal Bank of Scotland')
.arguments('<file> <provider>')
.option('-s, --start-date <ISODate>', 'Calculation start date.')
.option('-h, --household', 'Calculate household expenses.')
.option('-e, --eating-out', 'Calculate household expenses.')
.option('-c, --coffee-out', 'Calculate coffee out expenses.')
.option('-t, --transport', 'Calculate transport expenses.')
.action((file, provider) => {
  const opts = {
    dictionary: config,
    startDate: program.startDate,
    provider: provider
  };

  const tt = telltally(opts);
  tt.transactionsFrom(file);
  _.keys(config).map(key => _.camelCase(key)).forEach(expense => {
    if(program.hasOwnProperty(expense)) { tt.calculate(expense); }
  });
  tt.tally((err, tally) => {
    console.log(chalk.inverse.blue(">|>| YOUR TALLY |<|<"));
    // console.log(chalk.bold.magenta("Start date    :" + program.startDate));
    console.log(chalk.green('Coffee Out       : £', tally.coffeeOut));
    console.log(chalk.green('Eating Out       : £', tally.eatingOut));
    console.log(chalk.green('Final total      : £', tally.total));
  });
})
.parse(process.argv);

if (!program.args.length) program.help();