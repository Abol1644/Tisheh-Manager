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

import Btn from '@/components/elements/Btn';
import { flex } from '@/models';
import { formatPrice } from '@/utils/persianNumbers';
import DeleteModal from '@/pages/Dashboard/Sales/Modals/DeleteModal';

import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from "@/contexts/SnackBarContext";
import { ListCart } from '@/models'; // Or ListCart if you prefer to keep naming
import { getCartList, deleteCart } from '@/api';

interface DecodedToken {
  [key: string]: any;
}

export function CartDrawer() {
  const [loading, setLoading] = useState(false);
  const [deleteItemModal, setDeleteItemModal] = useState(false);
  const [cartId, setCartId] = useState<number | null>(null);
  const [groupedItems, setGroupedItems] = useState<Record<string, ListCart[]>>({});
  const { decodedToken } = useAuth();
  const userName = (decodedToken as DecodedToken)?.Name;
  const [expanded, setExpanded] = useState<string | false>(userName || false);

  const { showSnackbar, closeSnackbarById } = useSnackbar();

  useEffect(() => {
    setExpanded(userName || false);
  }, [userName]);

  useEffect(() => {
    setLoading(true);
    getCartList()
      .then((data: ListCart[]) => {
        // 👇 Group by "name"
        const grouped = data.reduce((acc, item) => {
          const key = item.name || 'بدون نام'; // Fallback for null/undefined names
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

  return (
    <React.Fragment>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          لیست سبدهای خرید
        </Typography>
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
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
                          <Btn variant='outlined' fullWidth sx={{ py: 1, mb: 1, ...flex.justifyBetween }}>
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
          <Typography>هیچ سفارشی یافت نشد.</Typography>
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