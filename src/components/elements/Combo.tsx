import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";

import {
  Box,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { useThemeMode } from "@/contexts/ThemeContext";
import Btn from "@/components/elements/Btn";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Simple option type - just a string array or any object array
type Option = string | Record<string, any>;

interface ComboProps {
  className?: string;
  options: Option[];
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  value?: any;
  defaultValue?: any; // Add default value support
  inputValue?: string;
  onChange?: (value: any) => void;

  // Specify how to get label from your objects
  getOptionLabel?: (option: Option) => string;
  getOptionValue?: (option: Option) => any;

  // Menu props
  menu?: boolean;
  menuItems?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    menuClassName?: string;
    menuItemDisabled?: boolean;
  }[];
  menuIcon?: React.ReactNode;
  loading?: boolean;
  // Pass through any other props to Autocomplete
  [key: string]: any;
}

export default function Combo({
  className = "",
  options = [],
  multiple = false,
  label = "",
  placeholder = "",
  value,
  defaultValue,
  onChange,
  getOptionLabel: customGetOptionLabel,
  getOptionValue: customGetOptionValue,
  menu = false,
  menuItems = [],
  menuIcon,
  inputValue,
  loading,
  ...rest
}: ComboProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { mode } = useThemeMode();

  // Helper function to get option label
  const getOptionLabel = (option: Option): string => {
    if (customGetOptionLabel) return customGetOptionLabel(option);
    if (typeof option === 'string') return option;
    // Try common label properties
    return option.label || option.name || option.title || String(option.value || option.id || option);
  };

  const getOptionValue = (option: Option): any => {
    if (customGetOptionValue) return customGetOptionValue(option);
    if (typeof option === 'string') return option;
    return option.codeAcc || option.ididentity;
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (onClick: () => void) => {
    onClick();
    handleMenuClose();
  };

  const autocompleteProps = {
    multiple,
    options,
    value,
    defaultValue, // Pass through defaultValue
    inputValue,
    disableCloseOnSelect: multiple,
    getOptionLabel,
    onChange: (_event: any, newValue: any) => onChange?.(newValue),

    isOptionEqualToValue: (option:any, value:any) => {
      if (!value) return false;
      return getOptionValue(option) === getOptionValue(value);
    },

    renderOption: (props: any, option: Option, { selected }: any) => (
      <li {...props} key={getOptionValue(option)}>
        {multiple && (
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
        )}
        {getOptionLabel(option)}
      </li>
    ),

    renderTags: multiple ? (tagValue: Option[], getTagProps: any) =>
      tagValue.map((option, index) => (
        <Chip
          label={getOptionLabel(option)}
          {...getTagProps({ index })}
          key={getOptionLabel(option)}
        />
      )) : undefined,

    renderInput: (params: any) => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        variant="outlined"
        InputProps= {{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    ),

    ...rest
  };

  if (menu) {
    return (
      <Box
        className={
          mode === "dark"
            ? "combo-menu-container-dark"
            : "combo-menu-container-light"
        }
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          ...(rest.sx || {}),
        }}
      >
        <Autocomplete
          className={`combo-with-menu ${className}`}
          {...autocompleteProps}
          sx={{ flex: 1 }}
        />

        {menuItems.length > 0 && (
          <>
            <Btn
              className={'combo-menu-button'}
              onClick={handleMenuClick}
              variant="outlined"
              sx={{
                minWidth: "auto",
                padding: "8px 12px",
                color: "text.secondary",
              }}
            >
              {menuIcon || <MenuOpenRoundedIcon />}
            </Btn>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
              {menuItems.map((item, index) => (
                <MenuItem
                  className={item.menuClassName}
                  key={index}
                  disabled={item.menuItemDisabled}
                  onClick={() => handleMenuItemClick(item.onClick)}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {item.icon}
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    );
  }

  return (
    <Autocomplete
      className={`combo ${className}`}
      {...autocompleteProps}
    />
  );
}