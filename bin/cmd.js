#! /usr/bin/env node

'use strict';

const fs            = require('fs')
    , _             = require('lodash')
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
.usage('[options] <charges.json>')
.description('Calculate spending from charges created using TT-translate.')
.arguments('<file>')
.option('-d, --from-date [DD-MM-YYYY]', 'Start calculating from this date.', parseDate)
.option('-g, --grocery', 'Calculate grocery expenses.')
.option('-e, --eating-out', 'Calculate eating out expenses.')
.option('-c, --coffee-out', 'Calculate coffee out expenses.')
.option('-t, --transport', 'Calculate transport expenses.')
.action(chargesPath => {

  const charges = h.wrapCallback(fs.readFile)(chargesPath).map(JSON.parse);
  const tt = telltally(charges, {
    dictionary: config,
    fromDate: program.fromDate
  });

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