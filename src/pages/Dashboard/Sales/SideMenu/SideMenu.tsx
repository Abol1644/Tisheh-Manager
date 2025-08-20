import { useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import {
  ToggleButton,
  Box,
  Drawer,
  Divider,
  IconButton,
  Tabs, Tab,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';

import { useThemeMode } from '@/contexts/ThemeContext';
import { flex, width, height } from '@/models/ReadyStyles';


export function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      className='sales-tab-panel'
      hidden={value !== index}
      sx={{
        display: value === index ? 'block' : 'none',
        bgcolor: 'background.paper',
        ...height.full
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

export function CustomTab({ value, onChange }: { value: number; onChange: (event: React.SyntheticEvent, newValue: number) => void; }) {
  const { mode } = useThemeMode();

  return (
    <Box
      className='sales-menu-tabs'
      sx={{
        backgroundColor: 'background.paper',
        ...flex.one
      }}
    >
      <Tabs
        orientation="horizontal"
        variant="fullWidth"
        value={value}
        onChange={onChange}
        sx={{ width: '100%' }}
        indicatorColor='primary'
        textColor='primary'
      >
        <Tab
          label="سبد خرید"
          icon={<AddShoppingCartRoundedIcon />}
          iconPosition='start'
        />
        <Tab
          label="دسته بندی"
          icon={<SortIcon />}
          iconPosition='start'
        />
      </Tabs>
    </Box>
  );
}