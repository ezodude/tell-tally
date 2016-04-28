# telltally

A calculator that calculates spending.

# Example

This will tally coffee out, eating out, household and transport spend directly from your bank statement. For now, RBS is the only bank we support.

```
$ tt -c -e -h -t path/to/bank-statement.csv rbs
```

# Help us supported more banks

For now, we only support parsing RBS statments. But it would be awesome if we can support where you bank!

Just fork the project and create your own provider. Do use the RBS provider as a template.