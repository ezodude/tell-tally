#! /usr/bin/env node

'use strict';

const _             = require('lodash')
    , csv           = require('fast-csv')
    , program       = require('commander')
    , config        = require('config')
    , chalk         = require('chalk')
    , h             = require('highland')
    , moment        = require('moment')
    , telltally     = require('../');


function parseDate(val){
  let result = moment.utc(val, "DD-MM-YYYY");
  if(!result.isValid()) { throw "Invalid from date. Please use the correct format [DD-MM-YYYY]."; }
  return result.toISOString();
}

program
.usage('[options] <transactions.csv> <provider>')
.description('Calculate your spending from a transactions or statement csv.\n\n' + '  Provider options:\n\n  * rbs: Royal Bank of Scotland')
.arguments('<file> <provider>')
.option('-d, --from-date [DD-MM-YYYY]', 'Start calculating from this date.', parseDate)
.option('-g, --grocery', 'Calculate grocery expenses.')
.option('-e, --eating-out', 'Calculate eating out expenses.')
.option('-c, --coffee-out', 'Calculate coffee out expenses.')
.option('-t, --transport', 'Calculate transport expenses.')
.action((file, provider) => {
  const opts = {
    dictionary: config,
    fromDate: program.fromDate,
    provider: provider
  };

  const tt = telltally(opts);
  tt.transactionsFrom(file);
  _.keys(config).map(key => _.camelCase(key)).forEach(expense => {
    if(program.hasOwnProperty(expense)) { tt.calculate(expense); }
  });
  tt.tally((err, tallies) => {
    if(err) { return console.log('Tallying error:', err); }

    console.log(chalk.inverse.blue(">|>| YOUR TALLY |<|<"));

    const total = tallies.total;
    delete tallies.total;

    _.keys(tallies).forEach(expense => {
      const expenseName = _.capitalize(_.snakeCase(expense).split(/\_/g).join(' '));
      console.log(chalk.green(`${expenseName} => £ ${tallies[expense]}`));
    });
    console.log(chalk.green(`Final total => £ ${total}`));
  });
})
.parse(process.argv);

if (!program.args.length) program.help();