import React, { useState, useCallback, ChangeEvent, FocusEvent, useEffect } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const PhoneField: React.FC<TextFieldProps> = (props) => {
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<string>(props.value as string || '');
  
  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value as string);
    }
  }, [props.value]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // حذف کاراکترهای غیر عددی
    const numericValue = input.replace(/[^۰-۹0-9]/g, '');
    
    // تبدیل اعداد انگلیسی به فارسی
    const persianNumbers = numericValue
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
    
    // اعتبارسنجی طول شماره تلفن
    if (persianNumbers.length > 11) return;
    
    // اعتبارسنجی فرمت اولیه: باید با "۰" شروع شود
    if (persianNumbers.length >= 1 && persianNumbers[0] !== '۰') return;
    
    // اعتبارسنجی فرمت ثانویه:
    // - اگر طول 1 یا بیشتر است: باید با ۰ شروع شود
    // - اگر طول 2 یا بیشتر است: رقم دوم باید ۲ یا ۹ باشد
    if (persianNumbers.length >= 2) {
      const secondChar = persianNumbers[1];
      if (secondChar !== '۹' && secondChar !== '۲') return;
    }
    
    // اعتبارسنجی فرمت تهران (021)
    if (persianNumbers.length >= 3 && persianNumbers.startsWith('۰۲')) {
      const thirdChar = persianNumbers[2];
      if (thirdChar !== '۱') return;
    }
    
    // به روزرسانی مقدار
    const newValue = persianNumbers;
    setValue(newValue);
    e.target.value = newValue;
    
    if (props.onChange) props.onChange(e);
    
    // ریست خطا هنگام تغییر
    if (error) setError(null);
  }, [error, props.onChange]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^۰-۹]/g, '');
    
    // اعتبارسنجی نهایی
    if (!value) {
      setError('شماره تلفن را وارد نمایید');
      return;
    }
    
    if (value.length < 10 || value.length > 11) {
      setError('شماره تلفن باید ۱۰ یا ۱۱ رقمی باشد');
      return;
    }
    
    if (value[0] !== '۰') {
      setError('شماره تلفن باید با صفر شروع شود');
      return;
    }
    
    // اعتبارسنجی فرمت‌های مختلف
    if (value.startsWith('۰۹') && value.length === 11) {
      // شماره همراه (۱۱ رقمی)
      setError(null);
    } 
    else if (value.startsWith('۰۲۱') && value.length === 11) {
      // شماره ثابت تهران (۱۱ رقمی)
      setError(null);
    }
    else if (value.startsWith('۰۲') && value.length === 10) {
      // شماره ثابت سایر شهرها (۱۰ رقمی)
      setError(null);
    }
    else {
      setError('فرمت شماره تلفن نامعتبر است');
    }
  }, [error]);

  return (
    <TextField
      {...props}
      value={value}
      error={!!error}
      helperText={error || props.helperText}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{
        inputMode: 'tel',
        ...props.inputProps,
      }}
    />
  );
};

export default PhoneField;