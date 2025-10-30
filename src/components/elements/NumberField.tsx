import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  IconButton,
  InputLabel,
  OutlinedInput,
  FormControl,
  FormHelperText,
  OutlinedInputProps
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

interface NumberFieldProps extends Omit<OutlinedInputProps, 'value' | 'onChange'> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
  helperText?: string;
  decimal?: boolean;
  sx?: object;
  fullWidth?: boolean;
}

const NumberField: React.FC<NumberFieldProps> = ({
  label = '',
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  error = false,
  helperText,
  decimal = false,
  fullWidth = false,
  sx,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Regex for valid partial input
  const regex = decimal
    ? /^-?(\d+)?(\.)?(\d*)?$/
    : /^\d*$/;

  // Convert any Persian digits/punctuation to English
  const toEnglishDigits = (str: string): string => {
    return str
      .replace(/[۰-۹]/g, (char) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'].indexOf(char).toString())
      .replace(/[,٫]/g, '.'); // Normalize decimal separators
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let value = toEnglishDigits(rawValue);

    // Show live input
    setInternalValue(value);

    // Validate format
    if (!regex.test(value) && value !== '-') return;

    // If only "-" or "." → allow editing
    if (value === '.' || value === '-') return;

    const num = parseFloat(value);
    if (isNaN(num)) return;

    // Clamp within bounds
    const finalValue = Math.min(
      Math.max(num, min ?? -Infinity),
      max ?? Infinity
    );

    // Only update external state if valid number
    onChange(decimal ? parseFloat(finalValue.toFixed(2)) : Math.floor(finalValue));
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(internalValue);
    if (!isNaN(num)) {
      const rounded = decimal ? parseFloat(num.toFixed(2)) : Math.floor(num);
      setInternalValue(rounded.toString());
      onChange(rounded);
    } else {
      setInternalValue(value.toString());
    }
  };

  const increase = () => {
    const current = parseFloat(internalValue) || 0;
    const newVal = decimal
      ? parseFloat((current + step).toFixed(2))
      : Math.floor(current + step);
    const clamped = Math.min(newVal, max ?? Infinity);
    setInternalValue(clamped.toString());
    onChange(clamped);
  };

  const decrease = () => {
    const current = parseFloat(internalValue) || 0;
    const newVal = decimal
      ? parseFloat((current - step).toFixed(2))
      : Math.ceil(current - step);
    const clamped = Math.max(newVal, min ?? -Infinity);
    setInternalValue(clamped.toString());
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increase();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrease();
    }
  };

  return (
    <FormControl fullWidth={fullWidth} variant="outlined" size="small" error={error} sx={{ flex: 1, ...sx }}>
      {label && (
        <InputLabel
          shrink
          sx={{
            backgroundColor: 'var(--background-paper) !important',
            width: '50px',
            padding: '0 0 0 7px',
            top: '3px',
          }}
        >
          {label}
        </InputLabel>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row-reverse',
          border: '1px solid',
          borderColor: error ? 'error.main' : 'grey.400',
          borderRadius: '14px',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 1.2,
          py: 0.4,
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <OutlinedInput
          fullWidth
          {...props}
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          inputProps={{
            inputMode: decimal ? 'decimal' : 'numeric',
            style: { paddingRight: '4px', paddingLeft: '4px', textAlign: 'start', direction: 'ltr' },
          }}
          sx={{
            flex: 1,
            border: 'none',
            '& fieldset': { display: 'none' },
            '& input': {
              textAlign: 'center',
              fontSize: '1rem',
              fontFamily: 'SansX',
            },
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <IconButton size="small" onClick={increase} color="inherit" sx={{ p: '1.2px' }}>
            <Add fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={decrease} color="inherit" sx={{ p: '1.2px' }}>
            <Remove fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default NumberField;