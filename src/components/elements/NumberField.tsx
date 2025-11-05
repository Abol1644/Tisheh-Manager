import React, { useState, useCallback } from 'react';
import { Add, Remove } from '@mui/icons-material';
import './NumberField.css';


interface NumberFieldProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  decimal?: boolean;
  label?: string;
  width?: number | string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const NumberField: React.FC<NumberFieldProps> = ({
  value: propValue = 0,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  decimal = false,
  label,
  width = '100%',
  disabled = false,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(propValue.toString());

  
  React.useEffect(() => {
    if (propValue !== undefined && !isNaN(propValue)) {
      setInputValue(propValue.toString());
    }
  }, [propValue]);

  const clamp = useCallback(
    (n: number) => Math.min(Math.max(n, min), max),
    [min, max]
  );

  const commitValue = useCallback(
    (num: number) => {
      const clamped = clamp(num);
      onChange(decimal ? parseFloat(clamped.toFixed(2)) : Math.floor(clamped));
      return clamped;
    },
    [onChange, clamp, decimal]
  );

  const increment = () => {
    const current = propValue ?? 0;
    const next = decimal
      ? parseFloat((current + step).toFixed(2))
      : Math.floor(current + step);
    const committed = commitValue(next);
    setInputValue(committed.toString());
  };

  const decrement = () => {
    const current = propValue ?? 0;
    const next = decimal
      ? parseFloat((current - step).toFixed(2))
      : Math.ceil(current - step);
    const committed = commitValue(next);
    setInputValue(committed.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    
    if (raw === '' || raw === '-' || raw === '.') {
      return;
    }

    
    if ((raw.match(/\./g) || []).length > 1) {
      return;
    }

    
    if (raw !== '0' && /^0\d/.test(raw)) {
      return;
    }

    
    const validFormat = decimal ? /^-?\d*\.?\d*$/ : /^\d*$/.test(raw);
    if (!validFormat) return;

    const num = parseFloat(raw);
    if (isNaN(num)) return;

    commitValue(num);
  };

  const handleBlur = () => {
    setFocused(false);
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setInputValue(propValue?.toString() ?? '0');
    } else {
      const committed = commitValue(num);
      setInputValue(committed.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  };

  const displayValue = inputValue === '' ? '' : inputValue;

  return (
    <div className={`number-field ${focused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`} style={{ width, ...style }}>
      {label && <label className="number-field-label">{label}</label>}
      <div className="number-field-input-wrapper" style={{ ...style }}>
        <div className="number-field-buttons">
          <button type="button" onClick={increment} className="btn-inc" disabled={disabled}>
            <Add fontSize="small" />
          </button>
          <button type="button" onClick={decrement} className="btn-dec" disabled={disabled}>
            <Remove fontSize="small" />
          </button>
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown} 
          placeholder={label}
          disabled={disabled}
          className="number-field-input"
        />
      </div>
    </div>
  );
};

export default NumberField;