import React, { useEffect, useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Slide, IconButton,
  Tooltip,
  Zoom
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded"
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import Btn from '@/components/elements/Btn';
import { flex } from '@/models';
import { formatPrice } from '@/utils/persianNumbers';
import DeleteModal from '@/pages/Dashboard/Sales/Modals/DeleteModal';

import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from "@/contexts/SnackBarContext";
import { ListCart, Cart, CartDetails } from '@/models'; 
import { getCartList, deleteCart, getCart, getListOfCartItems } from '@/api';
import { useControlCart } from '@/stores';

interface DecodedToken {
  [key: string]: any;
}

export function CartDrawer() {
  const [loading, setLoading] = useState(false);
  const [deleteItemModal, setDeleteItemModal] = useState(false);
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartDetails, setCartDetails] = useState<CartDetails | null>(null);
  const [groupedItems, setGroupedItems] = useState<Record<string, ListCart[]>>({});
  const { decodedToken } = useAuth();
  const userName = (decodedToken as DecodedToken)?.Name;
  const [expanded, setExpanded] = useState<string | false>(userName || false);

  const { showSnackbar, closeSnackbarById } = useSnackbar();
  const { isCartOpen, toggleCart, cartOpen, cartClose, openCartId, setOpenCartId } = useControlCart();

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
    cartOpen()
    setOpenCartId(cart.id)
    // getCart(cart.id)
    //   .then((data: CartDetails) => {
    //     setCartDetails(data);
        
    //     console.log('Fetched cart details:', data);
    //   })
    //   .catch((error) => {
    //     console.error('Error fetching cart details:', error);
    //   });
  }

  const getCartItems = (cart: ListCart) => {
    console.log("🚀 ~ getCartItems ~ cart:", cart)
    cartOpen()
    getListOfCartItems(cart)
      .then((data: Cart) => {
        console.log('Fetched cart items:', data);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
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
          <CircularProgress />
        ) : Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([name, items], index) => (
            <Slide
              key={name}
              direction="up"
              in={!loading}
              mountOnEnter
              unmountOnExit
              timeout={300}
              style={{
                transitionDelay: `${index * 30}ms`,
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
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>
                    {name} ({items.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {items.map((item) => (
                      <ListItem
                        key={item.id}
                        sx={{
                          p: 0,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            scale: 1.02,
                          },
                        }}
                      >
                        <Tooltip
                          title={<p><strong>پروژه</strong> {item.projectIdCustomerTitle}</p>}
                          placement="left"
                          arrow
                          disableInteractive
                          slots={{ transition: Zoom }}
                        >
                          <Btn
                            variant='outlined'
                            fullWidth
                            onClick={() => sendCartId(item)}
                            sx={{ py: 1, mb: 1, ...flex.justifyBetween }}
                          >
                            <Box sx={{ ...flex.row }}>
                              <ShoppingCartRoundedIcon sx={{ mr: 1 }} />
                              <Typography variant="body2" align='right'>
                                {item.codeAccCustomerTitle}
                              </Typography>
                            </Box>
                            <DeleteRoundedIcon
                              onClick={() => openDeleteModal(item.id)}
                              sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  color: 'error.main',
                                },
                              }}
                            />
                          </Btn>
                        </Tooltip>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Slide>
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