const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Formats a number as a price:
 * - Rounds down (removes decimals)
 * - Adds commas every 3 digits
 * - Converts to Persian digits
 * 
 * @param {number|string|null|undefined} value - The number to format
 * @param {boolean} withCommas - Whether to add thousand separators
 * @returns {string} Formatted price with Persian digits
 */
export const formatPrice = (value, withCommas = true) => {
  if (value === null || value === undefined || isNaN(value)) return '';

  // Step 1: Convert to number and remove decimals by truncating (like floor for positive numbers)
  const roundedValue = Math.floor(Number(value));

  // Step 2: Convert to string and remove any existing commas
  let numStr = roundedValue.toString().replace(/,/g, '');

  // Step 3: Add commas every 3 digits (thousands separator)
  if (withCommas) {
    numStr = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Step 4: Convert English digits 0-9 to Persian digits
  return numStr.replace(/[0-9]/g, (match) => persianDigits[parseInt(match, 10)]);
};

/**
 * Parses Persian-number string back to English number
 * @param {string|number} persianNumber
 * @returns {number} Parsed number
 */
export const parseToEnglish = (persianNumber) => {
  if (!persianNumber) return 0;
  const str = persianNumber.toString();
  const englishStr = str.replace(/[۰-۹]/g, (char) => persianDigits.indexOf(char));
  const num = parseFloat(englishStr);
  return isNaN(num) ? 0 : num;
};

/**
 * Replaces only English digits (0-9) with Persian digits.
 * Leaves all other characters (including separators) unchanged.
 * @param {string|number} input
 * @returns {string}
 */
export function toPersianDigits(input) {
  if (input === null || input === undefined) return '';
  return input.toString().replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)]);
}