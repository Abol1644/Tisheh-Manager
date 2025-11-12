import { useCallback } from 'react';
import { formatPrice, parseToEnglish } from '@/utils/persianNumbers';

function toPersianNumber(input: string | number): string {
  const toString = String(input);
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return toString.replace(/\d/g, d => persianDigits[+d]);
}

const usePersianNumbers = (): {
  toPersianPrice: (value: any) => string;
  toPersianNumber: (input: string | number) => string;
} => {
  const toPersianPrice = useCallback((value: any) => formatPrice(value), []);
  const toEnglishNumber = useCallback((value: any) => parseToEnglish(value), []);
  const toPersianNumberCallback = useCallback((input: string | number) => toPersianNumber(input), []);
  
  return { 
    toPersianPrice, 
    toPersianNumber: toPersianNumberCallback 
  };
};

export default usePersianNumbers;
export { toPersianNumber };