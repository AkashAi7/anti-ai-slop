import { stripAccents } from './text.mjs';

// Helper function to normalize the spaces in a string
function normalizeSpaces(s) {
  // split the string on any whitespace
  const parts = s.trim().split(/\s+/);
  // join the parts back together with single spaces
  return parts.join(' ');
}

/**
 * Converts any input into a URL-friendly slug.
 * @param {string} input - The input to slugify.
 * @returns {string} The slug.
 */
export function slugify(input) {
  try {
    console.log('slugify input', input);
    // convert to lowercase
    let result = input.toLowerCase();
    // remove the accents
    result = stripAccents(result);
    // replace anything that is not a letter or a number with a space
    result = result.replace(/[^a-z0-9]/g, ' ');
    // normalize the spaces
    result = normalizeSpaces(result);
    // replace the spaces with dashes
    result = result.split(' ').join('-');
    // return the result
    return result;
  } catch (e) {}
}
