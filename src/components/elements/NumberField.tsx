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
import { Add, Remove } from '@mui/icons-material';
import usePersianNumbers from '@/hooks/usePersianNumbers';
import { toPersianDigits } from '@/utils/persianNumbers';

interface NumberFieldProps extends Omit<OutlinedInputProps, 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
  helperText?: string;
  decimal?: boolean;
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
  ...props
}) => {
  const { toPersianPrice, toEnglishNumber } = usePersianNumbers();

  const decimalRegex = /^(\d+)?(\.\d*)?$/;
  const integerRegex = /^\d*$/;
  const validationRegex = decimal ? decimalRegex : integerRegex;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = toEnglishNumber(e.target.value);

    // Allow empty
    if (val === '') {
      onChange('0');
      return ; 
    }

    // Must match number pattern
    if (!validationRegex.test(val)) {
      return;
    }

    const num = parseFloat(val);

    // Check bounds
    if (min !== undefined && num < min) return; // ❌ Below min
    if (max !== undefined && num > max) return; // ❌ Above max

    onChange(val); // ✅ Valid
  };

  const increase = () => {
    const current = parseFloat(value || '0');
    if (isNaN(current)) return;
    const stepVal = step ?? 1;
    const maxVal = max ?? Infinity;
    const newVal = Math.min(current + stepVal, maxVal);
    onChange(newVal.toString());
  };

  const decrease = () => {
    const current = parseFloat(value || '0');
    if (isNaN(current)) return;
    const stepVal = step ?? 1;
    const minVal = min ?? -Infinity;
    const newVal = Math.max(current - stepVal, minVal);
    onChange(newVal.toString());
  };

  return (
    <FormControl fullWidth={fullWidth} variant="outlined" size="small" error={error} sx={{ flex: 1 }}>
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
          value={toPersianDigits(value)}
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