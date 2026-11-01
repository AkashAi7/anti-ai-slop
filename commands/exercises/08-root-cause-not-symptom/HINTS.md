# Hints

1. Try `'$1,299.99'` and `'12,345.50'` on the original code. `replace(',', '.')` turns a thousands separator into a decimal point.
2. Validate the whole string with one anchored regular expression before converting anything; reject everything that does not match.
3. Build cents from the whole and decimal parts with integer math (`whole * 100 + decimals`) instead of multiplying a float by 100.
