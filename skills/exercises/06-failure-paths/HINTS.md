# Hints

1. There are two separate failures: malformed syntax and wrong data shape.
2. Let the JSON parser's syntax error propagate.
3. Validate the parsed top-level array. Do not conflate an empty array with an exception.
