import { Box, Tabs, Tab, Tooltip, IconButton, Zoom,  } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinTwoToneIcon from '@mui/icons-material/PushPinTwoTone';

import { flex, height } from '@/models/ReadyStyles';


export function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      className='sales-tab-panel'
      hidden={value !== index}
      sx={{
        display: value === index ? 'block' : 'none',
        bgcolor: 'background.paper',
        ...height.full,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

interface CustomTabProps {
  value: number;
  drawerPinned: boolean;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  onPinToggle: () => void;
}

export function CustomTab({ value, onChange, onPinToggle, drawerPinned }: CustomTabProps) {

  return (
    <Box
      className='sales-menu-tabs'
      sx={{
        ...flex.one,
        ...flex.row,
        borderBottom: '2px solid var(--table-border-overlay)'
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
          label="دسته بندی"
          icon={<SortIcon />}
          iconPosition='start'
        />
        <Tab
          label="سبد خرید"
          icon={<AddShoppingCartRoundedIcon />}
          iconPosition='start'
        />
      </Tabs>
      <Tooltip
        title='سنجاق پنل'
        placement="left"
        arrow
        disableInteractive
        slots={{ transition: Zoom }}
        color='info'
      >
        <IconButton
          color="info"
          onClick={onPinToggle}
          sx={{
            height: '100%',
            borderRadius: 0,
            '& .MuiSvgIcon-root': { fontSize: '22px' },
          }}
        >
          {!drawerPinned ? <PushPinTwoToneIcon /> : <PushPinIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}