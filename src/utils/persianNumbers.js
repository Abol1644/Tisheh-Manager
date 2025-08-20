const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const formatPrice = (value, withCommas = true) => {
  if (value === null || value === undefined) return '';
  
  // Convert to string and remove any existing commas
  let numStr = value.toString().replace(/,/g, '');
  
  // Add commas every 3 digits
  if (withCommas) {
    numStr = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Convert to Persian digits
  return numStr.replace(/[0-9]/g, (match) => persianDigits[parseInt(match)]);
};

export const parseToEnglish = (persianNumber) => {
  if (!persianNumber) return '';
  return persianNumber.toString().replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));
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