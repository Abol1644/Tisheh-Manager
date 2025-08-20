// src/hooks/usePersianNumbers.js
import { useCallback } from 'react';
import { formatPrice, parseToEnglish } from '@/utils/persianNumbers';

const usePersianNumbers = () => {
  const toPersianPrice = useCallback((value) => formatPrice(value), []);
  const toEnglishNumber = useCallback((value) => parseToEnglish(value), []);
  
  return { toPersianPrice, toEnglishNumber };
};

export default usePersianNumbers;