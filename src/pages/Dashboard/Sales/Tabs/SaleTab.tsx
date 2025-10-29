import React, { useState, useEffect, useMemo, useCallback } from 'react';

import PageContainer from '@/components/PageContainer';
import { CartDrawer } from '@/pages/Dashboard/Sales/SideMenu/CartDrawer';
import { Category } from '@/pages/Dashboard/Sales/SideMenu/CategoryDrawer';
import { TabPanel, CustomTab } from '@/pages/Dashboard/Sales/SideMenu/SideMenu';
import { ProductSelect } from '@/pages/Dashboard/Sales/ProductSelect';
import { Cart } from '@/pages/Dashboard/Sales/Cart';
import CreateAccountModal from '@/pages/Dashboard/Sales/Modals/Account/CreateAccount';
import DeleteAccountModal from '@/pages/Dashboard/Sales/Modals/Account/DeleteAccount';
import ConnectToProjectModal from '@/pages/Dashboard/Sales/Modals/Account/ConnectToProject';
import AddProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/AddProjects';
import DeleteProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/DeleteProject';
import ConnectProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/ConnectProject';
import DisconnectProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/DisconnectProject';
import RecalculateProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/RecalculateProject';

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import {
  Box,
  Drawer,
  Paper,
  IconButton,
} from '@mui/material';

import { useThemeMode } from '@/contexts/ThemeContext';
import { height } from '@/models/ReadyStyles';

import { getSaleCategories } from '@/api';
import { CategorySale } from '@/models';

import { useProductsStore, useControlCart } from '@/stores';

const drawerWidth = 340;

export default function Sale() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerPinned, setDrawerPinned] = useState(() => {
    const saved = localStorage.getItem('drawerPinned');
    return saved ? JSON.parse(saved) : false;
  });
  const [categoryEnable, setCategoryEnable] = useState(true);
  const { mode } = useThemeMode();
  const [value, setValue] = useState(0);
  const { isCartOpen, cartOpen } = useControlCart();


  const [modals, setModals] = useState({
    accountAdd: false,
    accountEdit: false,
    accountDelete: false,
    connectToProject: false,
    projectAdd: false,
    projectEdit: false,
    projectDelete: false,
    projectConnect: false,
    projectDisconnect: false,
    projectRecalculate: false,
  });

  const [categories, setCategories] = useState<CategorySale[]>([]);
  const { setSelectedCategory } = useProductsStore();
  const [loading, setLoading] = useState(true);

  const handleCategorySelect = useCallback((category: CategorySale | null) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);

  useEffect(() => {
    const fetchCategories = () => {
      setLoading(true);
      getSaleCategories()
        .then(fetched => {
          if (Array.isArray(fetched)) {
            setCategories(fetched.sort((a, b) => a.sort - b.sort));
          }
        })
        .catch(err => {
          console.error('Failed to fetch categories:', err);
        })
        .finally(() => setLoading(false));
    };

    fetchCategories();
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    getSaleCategories()
      .then((fetchedCategories) => {
        if (Array.isArray(fetchedCategories)) {
          const sorted = fetchedCategories.sort((a, b) => a.sort - b.sort);
          setCategories(sorted);
        } else {
          console.warn('[Refresh] Expected array but received:', fetchedCategories);
        }
      })
      .catch((err) => {
        console.error('[Refresh] Failed to fetch categories:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const drawerPinnedRef = React.useRef(drawerPinned);

  useEffect(() => {
    drawerPinnedRef.current = drawerPinned;
    localStorage.setItem('drawerPinned', JSON.stringify(drawerPinned));
  }, [drawerPinned]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    if (!drawerPinnedRef.current) {
      setDrawerOpen(false);
    }
  };

  const handlePinToggle = () => {
    setDrawerPinned((prev:boolean) => {
      const newValue = !prev;
      return newValue;
    });
  };

  const memoizedCategories = useMemo(() => categories, [categories]);

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: mode === 'light' ? '#fff' : '#121212',
          }}
        >
          <CustomTab drawerPinned={drawerPinned} onPinToggle={handlePinToggle} value={value} onChange={(event, newValue) => setValue(newValue)} />
        </Box>

        <Box
          sx={{
            width: '100%',
            minHeight: 0,
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.paper',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          <TabPanel value={value} index={1}>
            <CartDrawer onDrawerToggle={handleDrawerClose} />
          </TabPanel>
          <TabPanel value={value} index={0}>
            <Category
              value={value}
              drawerOpen={drawerOpen}
              categoryEnable={categoryEnable}
              categories={memoizedCategories}
              loading={loading}
              onRefresh={handleRefresh}
              onCategorySelect={handleCategorySelect}
              onDrawerToggle={handleDrawerClose}
            />
          </TabPanel>
        </Box>
      </Box>

    </>
  );

  return (
    <>
      <Box
        className='sale-tab-page'
        sx={{
          display: 'flex',
          width: '100%',
          gap: drawerOpen ? '14px' : '0',
          ...height.full
        }}
      >
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: drawerOpen ? drawerWidth : 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'relative',
              border: 'none',
              borderRadius: '20px',
              scrollbarWidth: 'none',
              backgroundColor: 'background.default'
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Paper
          sx={{
            flexDirection: 'column', alignItems: 'center', justifyContent: 'start', mr: 1, borderRadius: '0 20px 20px 0', boxShadow: 'none',
            display: drawerOpen ? 'none' : 'flex'
          }}
        >
          <IconButton
            color='default'
            onClick={handleDrawerOpen}
            sx={{
              width: '24px',
              height: '100%',
              '& .MuiSvgIcon-root ': {
                fontSize: '32px',
              },
              borderRadius: 0
            }}
          >
            <MoreVertRoundedIcon />
          </IconButton>
        </Paper>

        <PageContainer justif='start' sx={{ overflow: 'hidden' }}>
          <Box
            component="main"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <Box
              className='sale-table-container'
              sx={{
                height: '100%',
                flex: 1,
                position: 'relative',
                overflow: 'visible'
              }}
            >
              <Box
                className={`cart-box ${isCartOpen ? 'animate-in' : 'animate-out'}`}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  height: '100%',
                  zIndex: isCartOpen ? 10 : 0
                }}
              >
                <Cart openCart={isCartOpen} setOpenCart={cartOpen} />
              </Box>

              <Box
                className={`datagrid-box ${!isCartOpen ? 'animate-in' : 'animate-out'}`}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  height: '100%',
                  zIndex: isCartOpen ? 0 : 10
                }}
              >
                <ProductSelect
                  drawerOpen={drawerOpen}
                  setDrawerOpen={setDrawerOpen}
                  openModal={openModal}
                  categoryEnable={categoryEnable}
                  setCategoryEnable={setCategoryEnable}
                />
              </Box>
            </Box>
          </Box>
        </PageContainer>
      </Box>

      {/* Modals */}
      <CreateAccountModal
        open={modals.accountAdd}
        onClose={() => closeModal('accountAdd')}
        formMode="create"
      />
      <CreateAccountModal
        open={modals.accountEdit}
        onClose={() => closeModal('accountEdit')}
        formMode="edit"
      />
      <ConnectToProjectModal
        open={modals.connectToProject}
        onClose={() => closeModal('connectToProject')}
      />
      <DeleteAccountModal
        open={modals.accountDelete}
        onClose={() => closeModal('accountDelete')}
      />
      <AddProjectModal
        open={modals.projectAdd}
        onClose={() => closeModal('projectAdd')}
        formMode="create"
      />
      <AddProjectModal
        open={modals.projectEdit}
        onClose={() => closeModal('projectEdit')}
        formMode="edit"
      />
      <DeleteProjectModal
        open={modals.projectDelete}
        onClose={() => closeModal('projectDelete')}
      />
      <ConnectProjectModal
        open={modals.projectConnect}
        onClose={() => closeModal('projectConnect')}
      />
      <RecalculateProjectModal
        open={modals.projectRecalculate}
        onClose={() => closeModal('projectRecalculate')}
      />
      <DisconnectProjectModal
        open={modals.projectDisconnect}
        onClose={() => closeModal('projectDisconnect')}
      />
    </>
  );
}