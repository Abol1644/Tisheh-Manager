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
  Zoom
} from '@mui/material';

import Btn from '@/components/elements/Btn';

import CloseIcon from '@mui/icons-material/Close';

interface AddToOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddToOrderModal({ open, onClose }: AddToOrderModalProps) {
  const [orderNumber, setOrderNumber] = React.useState<number | undefined>(undefined);
  const [shipmentNumber, setShipmentNumber] = React.useState<number | undefined>(undefined);

  const handleOrderIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrderNumber(Number(event.target.value));
  }

  const handleShipmentIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShipmentNumber(Number(event.target.value));
  }

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
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '500px',
            height: '280px',
            marginTop: '-140px',
            marginLeft: '-250px',
            bgcolor: 'background.glass',
            background: 'linear-gradient(-165deg, #00ff684d, var(--background-glass) 75%)',
            border: 'none',
            boxShadow: 0,
            p: '20px 25px ',
            borderRadius: '20px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 1300,
            backdropFilter: 'blur(5px)',
            '&:focus-visible': {
              outline: 'none'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant='h6'>افزودن به سفارش موجود</Typography>
            <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
              <IconButton
                aria-label="بستن"
                onClick={onClose}
                color='error'
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-around',
              height: '100%',
              width: '100%'
            }}
          >
            <TextField
              fullWidth
              id="orderId"
              label="شماره سفارش"
              value={orderNumber}
              onChange={handleOrderIdChange}
            />
            <TextField
              fullWidth
              id="shipmentId"
              label="شماره مرسوله"
              value={shipmentNumber}
              onChange={handleShipmentIdChange}
            />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row-reverse',
            gap: '12px',
            mt: 1
          }}
        >
          <Btn variant="contained" color="success" onClick={onClose} sx={{ height: '42px' }}>
            افزودن به سفارش
          </Btn>
        </Box>
      </Box>
    </Slide>
    </Modal >
  );
}