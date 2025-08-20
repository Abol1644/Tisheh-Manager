import React, { useState, useCallback, ChangeEvent, FocusEvent, useEffect } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const PriceField: React.FC<TextFieldProps> = (props) => {
  const [error, setError] = useState<string | null>(null);
  const [displayValue, setDisplayValue] = useState<string>('');
  
  useEffect(() => {
    const initialValue = props.value as string || '';
    // تبدیل به نمایشگر قیمت با جداکننده
    if (initialValue) {
      const formattedValue = formatWithCommas(initialValue);
      setDisplayValue(formattedValue);
    } else {
      setDisplayValue('');
    }
  }, [props.value]);

  const formatWithCommas = (numStr: string): string => {
    // حذف کاراکترهای غیرعددی
    const cleaned = numStr.replace(/[^۰-۹0-9]/g, '');
    
    if (!cleaned) return '';
    
    // تبدیل اعداد انگلیسی به فارسی
    const persianNumbers = cleaned
      .replace(/0/g, '۰')
      .replace(/1/g, '۱')
      .replace(/2/g, '۲')
      .replace(/3/g, '۳')
      .replace(/4/g, '۴')
      .replace(/5/g, '۵')
      .replace(/6/g, '۶')
      .replace(/7/g, '۷')
      .replace(/8/g, '۸')
      .replace(/9/g, '۹');
    
    // افزودن جداکننده هزارگان
    return persianNumbers
      .split('')
      .reverse()
      .join('')
      .match(/.{1,3}/g)
      ?.join(',')
      .split('')
      .reverse()
      .join('') || '';
  };

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // حذف کاماها و کاراکترهای غیرعددی
    const numericValue = input
      .replace(/,/g, '')
      .replace(/[^۰-۹0-9]/g, '');
    
    // ذخیره مقدار خام برای state خارجی
    e.target.value = numericValue;
    
    // ایجاد نمایش فرمت شده با جداکننده
    setDisplayValue(formatWithCommas(numericValue));
    
    if (props.onChange) props.onChange(e);
    
    // ریست خطا هنگام تغییر
    if (error) setError(null);
  }, [error, props.onChange]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^۰-۹0-9]/g, '');
    
    // اعتبارسنجی نهایی
    if (!numericValue) {
      setError('لطفاً قیمت را وارد نمایید');
    } else if (error) {
      setError(null);
    }
  }, [error]);

  return (
    <TextField
      {...props}
      value={displayValue}
      error={!!error}
      helperText={error || props.helperText}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{
        inputMode: 'numeric',
        ...props.inputProps,
      }}
    />
  );
};

export default PriceField;