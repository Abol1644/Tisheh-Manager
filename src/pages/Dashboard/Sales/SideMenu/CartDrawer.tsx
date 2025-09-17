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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ListCart } from '@/models'; // Or ListCart if you prefer to keep naming
import { getCartList } from '@/api';

export function CartDrawer() {
  const [loading, setLoading] = useState(false);
  const [groupedItems, setGroupedItems] = useState<Record<string, ListCart[]>>({});

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

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        لیست سبدهای خرید
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : Object.keys(groupedItems).length > 0 ? (
        Object.entries(groupedItems).map(([name, items]) => (
          <Accordion key={name}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${name}-content`}
              id={`${name}-header`}
            >
              <Typography>
                {name} ({items.length} مورد)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {items.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={
                        <>
                          <strong>پروژه:</strong> {item.projectIdCustomerTitle}
                        </>
                      }
                      secondary={
                        <>
                          <div><strong>آدرس:</strong> {item.address}</div>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>هیچ سفارشی یافت نشد.</Typography>
      )}
    </Box>
  );
}