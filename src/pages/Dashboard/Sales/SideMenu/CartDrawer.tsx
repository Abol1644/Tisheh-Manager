import React, { useEffect, useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Grow, IconButton,
  Tooltip,
  Zoom,
  Skeleton, Stack,
  Badge
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded"
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import Btn from '@/components/elements/Btn';
import { flex } from '@/models';
import DeleteModal from '@/pages/Dashboard/Sales/Modals/DeleteModal';

import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from "@/contexts/SnackBarContext";
import { ListCart, Cart, CartDetails, ItemResaultPrice } from '@/models';
import { getCartList, deleteCart, getCart, getListOfCartItems, findAccount, getConnectedProject, findWarehouse } from '@/api';
import { useControlCart, useAccountStore, useProjectStore, useBranchDeliveryStore } from '@/stores';
import usePersianNumbers from '@/hooks/usePersianNumbers';

interface DecodedToken {
  [key: string]: any;
}

function CartItemSkeleton() {
  return (
    <>
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={20} />
        <Stack spacing={1} sx={{ pl: 1, pt: 1 }}>
          <Stack spacing={1} sx={{}} direction="row">
            <Skeleton variant="rounded" width={200} height={40} sx={{ borderRadius: '52px' }} />
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '52px' }} />
          </Stack>
          <Stack spacing={1} sx={{}} direction="row">
            <Skeleton variant="rounded" width={200} height={40} sx={{ borderRadius: '52px' }} />
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '52px' }} />
          </Stack>
          <Stack spacing={1} sx={{}} direction="row">
            <Skeleton variant="rounded" width={200} height={40} sx={{ borderRadius: '52px' }} />
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '52px' }} />
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={1} sx={{ mt: 2 }}>
        <Skeleton variant="rounded" height={20} />
        <Stack spacing={1} sx={{ pl: 1, pt: 1 }}>
          <Stack spacing={1} sx={{}} direction="row">
            <Skeleton variant="rounded" width={200} height={40} sx={{ borderRadius: '52px' }} />
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '52px' }} />
          </Stack>
          <Stack spacing={1} sx={{}} direction="row">
            <Skeleton variant="rounded" width={200} height={40} sx={{ borderRadius: '52px' }} />
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '52px' }} />
          </Stack>
        </Stack>
      </Stack>
    </>
  )
}

export function CartDrawer({ onDrawerToggle }: { onDrawerToggle: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [deleteItemModal, setDeleteItemModal] = useState(false);
  const [cartId, setCartId] = useState<number | null>(null);
  const [groupedItems, setGroupedItems] = useState<Record<string, ListCart[]>>({});
  const { decodedToken } = useAuth();
  const userName = (decodedToken as DecodedToken)?.Name;
  const [expanded, setExpanded] = useState<string | false>(userName || false);

  const { showSnackbar } = useSnackbar();
  const { selectedAccount, setSelectedAccount, } = useAccountStore()
  const { setConnectedProjects, setSelectedProject, } = useProjectStore()
  const { isBranchDelivery, setIsBranchDelivery } = useBranchDeliveryStore()
  const {
    cartOpen,
    setCartProducts,
    setIsFetchingItems,
    setIsSelectingProject,
    setSelectedCartWarehouse
  } = useControlCart()

  const { toPersianPrice } = usePersianNumbers();

  useEffect(() => {
    setExpanded(userName || false);
  }, [userName]);

  useEffect(() => {
    setLoading(true);
    getCartList()
      .then((data: ListCart[]) => {
        const grouped = data.reduce((acc, item) => {
          const key = item.name || 'بدون نام';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {} as Record<string, ListCart[]>);

        setGroupedItems(grouped);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cart list:', error);
        setLoading(false);
      });
  }, []);

  const openDeleteModal = (cartId: number) => {
    setCartId(cartId);
    setDeleteItemModal(true);
  }

  const handleCartDelete = async (id: number | null) => {
    if (!id) return;

    try {
      await deleteCart(id);
      setGroupedItems(prev => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] = updated[key].filter(item => item.id !== id);
          if (updated[key].length === 0) delete updated[key];
        }
        return updated;
      });

      showSnackbar('سبد با موفقیت حذف شد', 'success', 1500, <DoneAllRoundedIcon />);
    } catch (error) {
      showSnackbar('حذف سبد ناموفق بود', 'error', 3000);
    } finally {
      setDeleteItemModal(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    getCartList()
      .then((data: ListCart[]) => {
        const grouped = data.reduce((acc, item) => {
          const key = item.name || 'بدون نام';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {} as Record<string, ListCart[]>);
        setExpanded(userName || false);
        setGroupedItems(grouped);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cart list:', error);
        setLoading(false);
      });
  }

  const sendCartId = (cart: ListCart) => {
    findAccount(cart.codeAccCustomer)
      .then((account) => {
        setSelectedAccount(account);

        const tryGetConnectedProject = (retryCount = 0) => {
          const acc = selectedAccount || account;
          if (acc) {
            getConnectedProject(isBranchDelivery, acc.codeAcc)
              .then((data) => {
                setConnectedProjects(data);
                setIsSelectingProject(true);
                onDrawerToggle();
                const matchedProject = data.find(project => project.id === cart.projectIdCustomer);

                if (matchedProject) {
                  // 🎯 Set the selected project in the store
                  setSelectedProject(matchedProject);
                  setIsSelectingProject(false);
                } else {
                  // Optional: reset if no match
                  setSelectedProject(null);
                }
                setIsSelectingProject(false);
              });
          } else if (retryCount < 3) {
            setTimeout(() => tryGetConnectedProject(retryCount + 1), 100);
          }
        };

        tryGetConnectedProject();
      });

    cartOpen();

    // Fetch items
    getListOfCartItems(cart)
      .then((data: ItemResaultPrice[]) => {
        setCartProducts(data);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
      });

    // 👇 Fetch cart details
    getCart(cart.id)
      .then((details: CartDetails) => {
        console.log("🎁 ~ sendCartId ~ details:", details)
        // Use the action we just added
        useControlCart.getState().setCurrentCartDetails(details);
        if (details.branchCenterDelivery) {
          setIsBranchDelivery(true);
          findWarehouse(details.warehouseId)
            .then((warehouse) => {
              setSelectedCartWarehouse(warehouse);
            })
        } else {
          setIsBranchDelivery(false);
        }
      })
      .catch((error) => {
        console.error('Failed to load cart details:', error);
      });
    getCartItems(cart)
  };

  const getCartItems = (cart: ListCart) => {
    setIsFetchingItems(true);
    getListOfCartItems(cart)
      .then((data: ItemResaultPrice[]) => {
        console.log('Fetched cart items:', data);
        setCartProducts(data);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
      })
      .finally(() => {
        setIsFetchingItems(false);
      });
  }

  return (
    <React.Fragment>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ ...flex.rowBetween, mb: 2 }}>
          <Box sx={{ ...flex.row, ...flex.alignCenter }}>
            <ShoppingCartRoundedIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              سبدهای خرید
            </Typography>
          </Box>
          <Tooltip
            title={<strong>بارگذاری مجدد</strong>}
            placement="top"
            arrow
            disableInteractive
            slots={{ transition: Zoom }}
          >
            <IconButton className='refresh-animation' onClick={handleRefresh}>
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {loading ? (
          <CartItemSkeleton />
        ) : Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([name, items], index) => (
            <Grow
              key={name}
              in={!loading}
              mountOnEnter
              unmountOnExit
              timeout={500}
              style={{
                transitionDelay: `${index * 30}ms`
              }}
            >
              <Accordion
                expanded={expanded === name}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? name : false)}
                sx={{
                  transition: 'all 0.3s ease',
                  margin: '4px 0',
                  '&.MuiPaper-root': {
                    borderRadius: '12px !important',
                    borderLeft: userName === name ? '2px solid var(--icon-main)' : '2px solid var(--primary-main)',
                  },
                  '&.MuiPaper-root::before': {
                    display: 'none !important'
                  },
                  '&.MuiPaper-root.Mui-expanded': {
                    margin: '4px 0',
                    transition: 'all 0.3s ease',
                  },
                  '&.MuiPaper-root, .Mui-expanded ': {
                    transition: 'all 0.3s ease'
                  },
                  width: '100%'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>
                    {name} - {toPersianPrice(items.length)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {items.map((item) => (
                      <ListItem
                        key={item.id}
                        sx={{ p: 0, transition: 'all 0.3s ease', mb: 1, '&:hover': { transform: 'translateX(4px)' } }} >
                        <Tooltip
                          title={<p><strong>پروژه</strong> {item.projectIdCustomerTitle}</p>}
                          placement="left"
                          arrow
                          disableInteractive
                          slots={{ transition: Zoom }}
                        >
                          <Btn
                            color='inherit'
                            variant='outlined'
                            fullWidth
                            sx={{ ...flex.justifyBetween }}
                          >
                            <Box sx={{ ...flex.row, width: '100%', py: 0.5 }} onClick={() => sendCartId(item)}>
                              <ShoppingCartRoundedIcon sx={{ mr: 1 }} />
                              
                                <Typography className='disable-line-height' color='textPrimary' variant="body2">
                                  {toPersianPrice(item.id)} - {item.codeAccCustomerTitle}
                                </Typography>
                            </Box>
                            <DeleteRoundedIcon
                              onClick={() => openDeleteModal(item.id)}
                              sx={{ transition: 'all 0.3s ease', '&:hover': { color: 'error.main' } }} />
                          </Btn>
                        </Tooltip>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grow>
          ))
        ) : (
          <Typography>هیچ سفارشی یافت نشد</Typography>
        )}
      </Box>
      <DeleteModal
        open={deleteItemModal}
        onClose={() => setDeleteItemModal(false)}
        title='حذف سبد'
        buttonText='حذف شود'
        info='سبد مورد نظر حذف شود؟'
        buttonFunc={() => { handleCartDelete(cartId) }}
      />
    </React.Fragment>
  );
}