import * as React from 'react';
import { Container, Box, Typography, Tab, Tabs, Backdrop, CircularProgress, Slide } from '@mui/material'
import { useThemeMode } from '@/contexts/ThemeContext';
import PersonIcon from '@mui/icons-material/Person';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import ContactsIcon from '@mui/icons-material/Contacts';
import PageContainer from '@/components/PageContainer'

const Sale = React.lazy(() => import('@/pages/Dashboard/Sales/Tabs/SaleTab'));
const Contacts = React.lazy(() => import('@/pages/Dashboard/Sales/Tabs/ContactsTab'));
const Orders = React.lazy(() => import('@/pages/Dashboard/Sales/Tabs/OrdersTab'));
const Accounts = React.lazy(() => import('@/pages/Dashboard/Sales/Tabs/AccountsTab'));

import '@/assets/css/salesStyle.css'

const TabPanel = React.memo(({ children, value, index, ...other }: any) => {
  const [hasBeenActive, setHasBeenActive] = React.useState(false);
  const isActive = value === index;

  React.useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [isActive, hasBeenActive]);

  if (!hasBeenActive) {
    return null;
  }

  return (
    <Slide in={isActive} direction='up' timeout={400}>
      <Box sx={{ display: isActive ? 'flex' : 'none', height: 'calc(100% - 66px)' }}>
        <React.Suspense
          fallback={
            <PageContainer justif='start'>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            </PageContainer>
          }
        >
          {children}
        </React.Suspense>
      </Box>
    </Slide>
  );
});

TabPanel.displayName = 'TabPanel';

function CustomTab({ value, onChange }: { value: number, onChange: (event: React.SyntheticEvent, newValue: number) => void }) {
  const { mode } = useThemeMode();

  return (
    <Box className='sales-tabs' sx={{ backgroundColor: 'background.paper' }} >
      <Tabs
        orientation="horizontal"
        variant="scrollable"
        value={value}
        onChange={onChange}
      >
        <Tab className='sales-tabs-button' label="فروش" icon={<AddShoppingCartRoundedIcon />} iconPosition='start' />
        <Tab className='sales-tabs-button' label="دفتر سفارشات" icon={<StickyNote2Icon />} iconPosition='start' />
        <Tab className='sales-tabs-button' label="دفتر حساب" icon={<ContactsIcon />} iconPosition='start' />
        <Tab className='sales-tabs-button' label="مخاطبین" icon={<PersonIcon />} iconPosition='start' />
      </Tabs>
    </Box>
  )
}

export default function SalePage() {
  const [value, setValue] = React.useState(0);

  return (
    <>
      <CustomTab value={value} onChange={(event, newValue) => setValue(newValue)} />

      <TabPanel className='sales-tab-panel' value={value} index={0}>
        <Sale />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Orders />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Accounts />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Contacts />
      </TabPanel>
    </>
  );
}
