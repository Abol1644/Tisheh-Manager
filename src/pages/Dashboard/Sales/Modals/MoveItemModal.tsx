import React from 'react';

import {
  Typography,
  Modal,
  Box,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Slide,
  Backdrop,
  Paper,
  Zoom
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';

import Btn from '@/components/elements/Btn';
import usePersianNumbers from '@/hooks/usePersianNumbers';
import NumberField from '@/components/elements/NumberField';

interface AddToOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MoveItemModal({ open, onClose }: AddToOrderModalProps) {
  const [orderNumber, setOrderNumber] = React.useState('');

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 150,
        },
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
            '&:focus-visible': {
              outline: 'none'
            },
            pointerEvents: 'none'
          }}
        >
          <Box
            sx={{
              width: '520px',
              height: 'auto',
              bgcolor: 'background.glass',
              background: 'linear-gradient(-165deg, #00ff684d, var(--background-glass) 75%)',
              border: 'none',
              boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
              p: '20px 20px',
              borderRadius: '25px',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(5px)',
              '&:focus-visible': {
                outline: 'none'
              },
              pointerEvents: 'auto'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant='h6' sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <SwapVertRoundedIcon />
                انتقال آیتم ها بین مرسوله ها
              </Typography>
              <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                <IconButton
                  aria-label="بستن"
                  onClick={onClose}
                  color='error'

                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ position: 'relative', p: 1, width: '100%', mt: 1 }}>
              <Paper
                sx={{
                  p: 2,
                  position: 'relative',
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  width: '100%',
                  background: 'transparent',
                  borderRadius: '16px'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 12,
                    transform: 'translateY(-50%)',
                    px: 1.5,
                    backgroundColor: 'transparent',
                    mb: 1,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      backgroundColor: 'background.paper',
                      zIndex: -1,
                      borderRadius: '30px'
                    }
                  }}
                >
                  <Typography variant="caption" color="text.primary">
                    آیتم های انتخاب شده
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: '5px',
                      width: '100%'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ mb: 1, }}>آجر فشاری حیدری</Typography>
                    <NumberField
                      id="itemNumber"
                      label="مقدار انتقال"
                      value={orderNumber}
                      onChange={setOrderNumber}
                      decimal={true}
                      fullWidth
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: '5px',
                      width: '100%'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>آجر فشاری حیدری</Typography>
                    <NumberField
                      id="itemNumber"
                      label="مقدار انتقال"
                      value={orderNumber}
                      onChange={setOrderNumber}
                      decimal={true}
                      fullWidth
                    />
                  </Box>
                  {/* Buttons row */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row-reverse',
                      gap: '12px',
                      mt: 1
                    }}
                  >
                    <Btn variant="contained" color="info" onClick={onClose} sx={{ height: '42px', mt: 1 }}>
                      انتقال به سفارش جدید
                    </Btn>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal >
  );
}