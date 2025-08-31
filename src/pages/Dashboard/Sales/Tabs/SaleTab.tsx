import React, { useState, useEffect, useMemo, useCallback } from 'react';

import PageContainer from '@/components/PageContainer';
import { CartDrawer } from '@/pages/Dashboard/Sales/SideMenu/CartDrawer';
import { Category } from '@/pages/Dashboard/Sales/SideMenu/CategoryDrawer';
import { TabPanel, CustomTab } from '@/pages/Dashboard/Sales/SideMenu/SideMenu';
import { ProductSelect } from '@/pages/Dashboard/Sales/ProductSelect';
import { Cart } from '@/pages/Dashboard/Sales/SabadKharid';
import CreateAccountModal from '@/pages/Dashboard/Sales/Modals/Account/CreateAccount';
import DeleteAccountModal from '@/pages/Dashboard/Sales/Modals/Account/DeleteAccount';
import ConnectToProjectModal from '@/pages/Dashboard/Sales/Modals/Account/ConnectToProject';
import AddProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/AddProjects';
import DeleteProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/DeleteProject';
import ConnectProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/ConnectProject';
import DisconnectProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/DisconnectProject';
import RecalculateProjectModal from '@/pages/Dashboard/Sales/Modals/Projects/RecalculateProject';
import BaseModal from '@/pages/Dashboard/Sales/Modals/BaseModal';

import {
  Box,
  Drawer,
  Paper,
  IconButton,
} from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';

import { useThemeMode } from '@/contexts/ThemeContext';
import Btn from '@/components/elements/Btn';
import { height } from '@/models/ReadyStyles';

import { getSaleCategories, getItemPrice, getCartList, getCart } from '@/api';
import { CategorySale, ItemResaultPrice, ListCart, Warehouse } from '@/models';

import { useProductsStore, useProjectStore } from '@/stores';

const MemoizedProductSelect = React.memo(ProductSelect);
const MemoizedCart = React.memo(Cart);
const MemCartDrawer = React.memo(CartDrawer);
const MemCategoryDrawer = React.memo(Category);
const MemTabPanel = React.memo(TabPanel);
const MemDrawer = React.memo(Drawer);

const drawerWidth = 340;

export default function Sale() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [categoryEnable, setCategoryEnable] = useState(true);
  const { mode } = useThemeMode();
  const [value, setValue] = useState(0);
  const [openCart, setOpenCart] = useState(false);

  const [modals, setModals] = useState({
    accountAdd: false,
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
  const [listCart, setListCart] = useState<ListCart[]>([]);
  const { setSelectedCategory } = useProductsStore();
  const { setSelectedProject } = useProjectStore();
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

  // useEffect(() => {
  //   const fetchCartList = () => {
  //     setLoading(true);
  //     getCartList()
  //       .then((list) => {
  //         setListCart(list);
  //       })
  //       .catch(err => {
  //         console.error('Failed to fetch CartList:', err);
  //       })
  //       .finally(() => setLoading(false));
  //   };
  //   fetchCartList();
  // }, []);

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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // ✅ Memoize categories for child
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
            borderBottom: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #616161',
          }}
        >
          <CustomTab value={value} onChange={(event, newValue) => setValue(newValue)} />
        </Box>

        <Box
          sx={{
            width: 'calc(100% - 10px)',
            minHeight: 0,
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.paper',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          <MemTabPanel value={value} index={1}>
            <MemCartDrawer
              setOpenCart={setOpenCart}
              openCart={openCart}
              value={value}
              drawerOpen={drawerOpen}
              listCart={listCart}
            />
          </MemTabPanel>
          <MemTabPanel value={value} index={0}>
            <MemCategoryDrawer
              value={value}
              drawerOpen={drawerOpen}
              categoryEnable={categoryEnable}
              categories={memoizedCategories}
              loading={loading}
              onRefresh={handleRefresh}
              onCategorySelect={handleCategorySelect}
            />
          </MemTabPanel>
        </Box>
      </Box>
      <IconButton
        color="info"
        onClick={handleDrawerToggle}
        sx={{
          position: 'absolute',
          right: 0,
          width: '25px',
          height: '100%',
          borderRadius: 0,
          '& .MuiSvgIcon-root': { fontSize: '30px' },
          bgcolor: 'background.paper',
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </>
  );

  return (
    <>
      {/* ... rest of your return JSX (unchanged) */}
      <Box
        className='sale-tab-page'
        sx={{
          display: 'flex',
          width: '100%',
          gap: drawerOpen ? '14px' : '0',
          ...height.full
        }}
      >
        <MemDrawer
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
        </MemDrawer>

        <Paper
          sx={{
            alignItems: 'center', justifyContent: 'center', mr: 1, borderRadius: '0 20px 20px 0', boxShadow: 'none',
            display: drawerOpen ? 'none' : 'flex'
          }}
        >
          <IconButton
            color='info'
            onClick={handleDrawerToggle}
            sx={{
              width: '20px',
              height: '100%',
              '& .MuiSvgIcon-root ': {
                fontSize: '30px'
              },
              borderRadius: 0
            }}
          >
            <MoreVertIcon />
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
                className={`cart-box ${openCart ? 'animate-in' : 'animate-out'}`}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  height: '100%',
                  zIndex: openCart ? 10 : 0
                }}
              >
                <MemoizedCart openCart={openCart} setOpenCart={setOpenCart} />
              </Box>

              <Box
                className={`datagrid-box ${!openCart ? 'animate-in' : 'animate-out'}`}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  height: '100%',
                  zIndex: openCart ? 0 : 10
                }}
              >
                <MemoizedProductSelect
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