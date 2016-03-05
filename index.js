#! /usr/bin/env node

'use strict';

const program   = require('commander')
    , chalk     = require('chalk');

program
.usage('[options] <file>')
.arguments('<file>')
.option('-s, --start-date <ISODate>', 'Tally start date.')
.option('-h, --household', 'Will tally household expenses.')
.option('-c, --coffee-out', 'Will tally coffee out expenses.')
.option('-t, --transport', 'Will tally transport expenses.')
.action(file => {

  console.log(chalk.inverse.blue(">|>| YOUR TALLY |<|<"));
  console.log(chalk.bold.magenta("Start date    :" + "2016-02-28T00:00:00Z"));
  console.log(chalk.green("Household     :" + "£200.00"));
  console.log(chalk.green("Coffee        :" + "£30.00"));
  console.log(chalk.green("Transport     :" + "£25.00"));

})
.parse(process.argv);