import React from 'react';
import {
  Box,
  IconButton,
  InputLabel,
  OutlinedInput,
  FormControl,
  FormHelperText,
  OutlinedInputProps,
} from '@mui/material';
import { Add, Remove, SixKOutlined } from '@mui/icons-material';
import usePersianNumbers from '@/hooks/usePersianNumbers';
import { toPersianDigits } from '@/utils/persianNumbers';

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
}

const NumberField: React.FC<NumberFieldProps> = ({
  label = '',
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  error,
  helperText,
  decimal = false,
  fullWidth = false,
  sx,
  ...props
}) => {
  const { toPersianPrice, toEnglishNumber } = usePersianNumbers();

  const decimalRegex = /^(\d+)?(\.\d*)?$/;
  const integerRegex = /^\d*$/;
  const validationRegex = decimal ? decimalRegex : integerRegex;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty
    if (inputValue === '') {
      onChange(0);
      return ; 
    }

    // Convert Persian digits to English for validation
    const englishValue = inputValue.replace(/[۰-۹]/g, (char) => {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return persianDigits.indexOf(char).toString();
    });

    // Must match number pattern
    if (!validationRegex.test(englishValue)) {
      return;
    }

    const num = parseFloat(englishValue);

    // Check bounds
    if (min !== undefined && num < min) return; // ❌ Below min
    if (max !== undefined && num > max) return; // ❌ Above max

    onChange(num); // ✅ Valid
  };

  const increase = () => {
    const current = value || 0;
    const stepVal = step ?? 1;
    const maxVal = max ?? Infinity;
    const newVal = Math.min(current + stepVal, maxVal);
    onChange(newVal);
  };

  const decrease = () => {
    const current = value || 0;
    const stepVal = step ?? 1;
    const minVal = min ?? -Infinity;
    const newVal = Math.max(current - stepVal, minVal);
    onChange(newVal);
  };

  return (
    <FormControl fullWidth={fullWidth} variant="outlined" size="small" error={error} sx={{ flex: 1, ...sx }}>
      {
        label &&
        <InputLabel
          shrink
          sx={{
            backgroundColor: 'var(--background-paper) !important',
            width: '50px',
            padding: '0 0 0 7px',
            top: '3px'
          }}
        >
          {label}
        </InputLabel>
      }
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
          value={toPersianDigits(value.toString())}
          onChange={handleChange}
          inputProps={{
            inputMode: decimal ? 'decimal' : 'numeric',
            style: { textAlign: 'start', direction: 'ltr' },
          }}
          sx={{
            flex: 1,
            border: 'none',
            px: 1,
            '& fieldset': { display: 'none' },
            '& input': {
              textAlign: 'center',
              fontSize: '1rem',
              fontFamily: 'SansX',
            },
            '& .MuiInputLabel-root ': {
              backgroundColor: 'var(--background-paper) !important',
              width: '50px',
              padding: '0 5px 0 0',
            },
            '& .MuiOutlinedInput-input': {
              padding: '8.5px 0 !important'
            }
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <IconButton
            size="small"
            onClick={increase}
            color='inherit'
            sx={{ p: '1.2px' }}
          >
            <Add fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={decrease}
            color='inherit'
            sx={{ p: '1.2px' }}
          >
            <Remove fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default NumberField;