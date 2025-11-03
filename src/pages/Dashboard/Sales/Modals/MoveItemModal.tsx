import React, { useState, useMemo } from 'react';

import {
  Typography,
  Modal,
  Box,
  IconButton,
  Tooltip,
  Button,
  Slide,
  Backdrop,
  Paper,
  Zoom,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';

import Btn from '@/components/elements/Btn';
import NumberField from '@/components/elements/NumberField';
import { ItemResaultPrice } from '@/models';
import usePersianNumbers from '@/hooks/usePersianNumbers';

import { useControlCart } from '@/stores';

interface MoveItemModalProps {
  open: boolean;
  onClose: () => void;
  items: ItemResaultPrice[];
  onUpdate: (updatedItems: ItemResaultPrice[]) => void;
}

// Unique ID generator for split items
let tempIdCounter = -1;
const generateTempId = () => tempIdCounter--;

// Helper function to generate consistent item keys (MUST match Cart.tsx)
const getItemKey = (item: ItemResaultPrice): string => {
  return `${item.ididentity}-${item.warehouseId}`;
};

export default function MoveItemModal({
  open,
  onClose,
  items,
  onUpdate,
}: MoveItemModalProps) {
  const [quantityMap, setQuantityMap] = useState<Record<number, number>>({});
  const [targetShipmentOption, setTargetShipmentOption] = useState<'new' | number>('new');
  const { toPersianPrice } = usePersianNumbers();

  const { addShipment, selectedItemKeys, clearSelectedItems, cartShipments } = useControlCart();

  const selectedItems = useMemo(() => {
    return items.filter((item) => {
      const key = getItemKey(item);
      return selectedItemKeys.has(key);
    });
  }, [items, selectedItemKeys]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      const initialQuantities: Record<number, number> = {};
      selectedItems.forEach((item) => {
        initialQuantities[item.ididentity] = item.value ?? 0;
      });
      setQuantityMap(initialQuantities);
      setTargetShipmentOption('new');
    }
  }, [open, selectedItems]);

  const handleSave = () => {
    if (!selectedItems.length) return;

    const updatedItemsList: ItemResaultPrice[] = [...items];
    let targetShipmentId: number;

    // Determine target shipment ID
    if (targetShipmentOption === 'new') {
      targetShipmentId = addShipment({
        warehouseId: null,
        deliveryMethod: null,
        deliveryDate: null,
      });
      console.log('✨ Created new shipment:', targetShipmentId);
    } else {
      targetShipmentId = targetShipmentOption;
      console.log('📦 Moving to existing shipment:', targetShipmentId);
    }

    // Process each selected item
    for (const selectedItem of selectedItems) {
      const itemId = selectedItem.ididentity;
      const currentQty = selectedItem.value ?? 0;
      const moveQty = Math.max(0, quantityMap[itemId] || 0);

      if (moveQty <= 0) {
        console.warn(`⚠️ Skipping item ${itemId} - move quantity is 0`);
        continue;
      }

      // Find the item in the full list
      const itemIndex = updatedItemsList.findIndex(i => i.ididentity === itemId);
      if (itemIndex === -1) {
        console.error(`❌ Item ${itemId} not found in items list`);
        continue;
      }

      if (moveQty >= currentQty) {
        // Full move - just update tempShipmentId
        console.log(`🔄 Full move: Item ${itemId} (${currentQty} units) → Shipment ${targetShipmentId}`);
        updatedItemsList[itemIndex] = {
          ...updatedItemsList[itemIndex],
          tempShipmentId: targetShipmentId,
        };
      } else {
        // Partial move - split the item
        console.log(`✂️ Split: Item ${itemId} - Keep ${currentQty - moveQty}, Move ${moveQty} → Shipment ${targetShipmentId}`);
        
        // Update original item (reduce quantity, keep in original shipment)
        updatedItemsList[itemIndex] = {
          ...updatedItemsList[itemIndex],
          value: currentQty - moveQty,
        };

        // Create new item for the moved portion with unique ID
        const newId = generateTempId();
        const newItem: ItemResaultPrice = {
          ...updatedItemsList[itemIndex],
          ididentity: newId,
          tempShipmentId: targetShipmentId,
          value: moveQty,
        };
        
        updatedItemsList.push(newItem);
        console.log(`➕ Created split item ${newId} with ${moveQty} units in shipment ${targetShipmentId}`);
      }
    }

    console.log('✅ Move operation complete. Updated items:', updatedItemsList.length);
    onUpdate(updatedItemsList);
    onClose();
  };

  const existingShipments = useMemo(() => {
    // Get all unique source shipment IDs from selected items
    const sourceShipmentIds = new Set(
      selectedItems.map(item => item.tempShipmentId).filter((id): id is number => id !== null)
    );

    // Get all shipments from the cart that are NOT source shipments
    const availableShipments = cartShipments.filter(
      shipment => !sourceShipmentIds.has(shipment.id)
    );

    console.log('📋 Available target shipments:', availableShipments.map(s => s.id));
    return availableShipments;
  }, [cartShipments, selectedItems]);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: { timeout: 150 },
      }}
    >
      <Slide in={open} direction="up">
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            '&:focus-visible': { outline: 'none' },
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              width: '600px',
              maxHeight: '80vh',
              bgcolor: 'background.paper',
              background: 'linear-gradient(-165deg, #00ff684d, var(--transparent) 75%)',
              border: 'none',
              boxShadow: 'inset 0 0 10px 1px rgba(255,255,255,0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
              p: '20px',
              borderRadius: '25px',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              
              pointerEvents: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SwapVertRoundedIcon />
                انتقال آیتم‌ها بین مرسوله‌ها
              </Typography>
              <Tooltip title="بستن" placement="top" arrow disableInteractive slots={{ transition: Zoom }}>
                <IconButton aria-label="بستن" onClick={onClose} color="error">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Paper
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'transparent',
                position: 'relative',
              }}
            >
              {/* Legend */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 12,
                  transform: 'translateY(-50%)',
                  px: 1.5,
                  backgroundColor: 'transparent',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backgroundColor: 'background.paper',
                    zIndex: -1,
                    borderRadius: '30px',
                  },
                }}
              >
                <Typography variant="caption" color="text.primary">
                  آیتم‌های انتخاب شده
                </Typography>
              </Box>

              {selectedItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    هیچ آیتمی انتخاب نشده است
                  </Typography>
                </Box>
              ) : (
                <>
                  <List dense>
                    {selectedItems.map((item) => (
                      <ListItem
                        key={getItemKey(item)}
                        sx={{
                          p: 1,
                          borderBottom: '1px solid divider',
                          flexDirection: 'column',
                          alignItems: 'start',
                        }}
                      >
                        <ListItemText
                          primary={<Typography variant="subtitle1">{item.title} {item.attributeGroupTitle}</Typography>}
                          secondary={`واحد: ${item.valueTitleBase || item.valueTitle || 'عدد'} | موجودی: ${toPersianPrice(item.value?.toFixed(2) || '0')}`}
                        />
                        <Box sx={{ mt: 1, width: '100%' }}>
                          <NumberField
                            label="مقدار انتقال"
                            value={quantityMap[item.ididentity] ?? 0}
                            onChange={(val) => {
                              const numVal = parseFloat(val as string) || 0;
                              const maxValue = item.value ?? 0;
                              // Clamp value between 0 and available quantity
                              const clampedValue = Math.min(Math.max(0, numVal), maxValue);
                              setQuantityMap((prev) => ({
                                ...prev,
                                [item.ididentity]: clampedValue,
                              }));
                            }}
                            decimal
                            fullWidth
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  {/* Target Shipment */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      مقصد انتقال
                    </Typography>
                    <RadioGroup
                      value={targetShipmentOption}
                      onChange={(e) =>
                        setTargetShipmentOption(
                          e.target.value === 'new' ? 'new' : Number(e.target.value)
                        )
                      }
                    >
                      <FormControlLabel
                        value="new"
                        control={<Radio />}
                        label="ایجاد مرسوله جدید"
                      />

                      {existingShipments.map((shipment, index) => (
                        <FormControlLabel
                          key={`ship-${shipment.id}`}
                          value={shipment.id}
                          control={<Radio />}
                          label={`مرسوله ${toPersianPrice((index + 1).toString())}`}
                        />
                      ))}
                    </RadioGroup>
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row-reverse',
                      gap: '12px',
                      mt: 3,
                    }}
                  >
                    <Btn 
                      variant="contained" 
                      color="info" 
                      onClick={handleSave} 
                      sx={{ height: '42px' }}
                      disabled={selectedItems.length === 0}
                    >
                      اعمال انتقال
                    </Btn>
                    <Button onClick={onClose} color="inherit">
                      انصراف
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
}