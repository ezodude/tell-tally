#! /usr/bin/env node

'use strict';

const _             = require('lodash')
    , csv           = require('fast-csv')
    , program       = require('commander')
    , config        = require('config')
    , chalk         = require('chalk')
    , h             = require('highland')
    , chargeStream  = require('./../providers/rbs').chargeStream
    , telltally  = require('../');

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
  tt.tally();

  console.log(chalk.inverse.blue(">|>| YOUR TALLY |<|<"));
  console.log(chalk.bold.magenta("Start date    :" + "2016-02-28T00:00:00Z"));
  console.log(chalk.green("Household     :" + "£200.00"));
  console.log(chalk.green("Coffee        :" + "£30.00"));
  console.log(chalk.green("Transport     :" + "£25.00"));
  console.log(chalk.green("Config (prufrock )     :" + config.get('coffee_out.prufrock_coffee_limited')));
})
.parse(process.argv);

if (!program.args.length) program.help();