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

import Btn from '@/components/elements/Btn';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

import usePersianNumbers from '@/hooks/usePersianNumbers';
import NumberField from '@/components/elements/NumberField';

interface AddToOrderModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  info?: string;
  buttonText?: string;
}

export default function DeleteModal({ open, onClose, title, info, buttonText }: AddToOrderModalProps) {
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
              background: 'linear-gradient(-165deg, #ff00004d, var(--background-glass) 75%)',
              border: 'none',
              boxShadow: '0 20px 20px -20px var(--text-secondary)',
              p: '20px 20px',
              borderRadius: '25px',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(5px)',
              justifyContent: 'space-between',
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
              <Typography
                variant='h6'
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}
              >
                <DeleteRoundedIcon />
                {title}
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
            <Box sx={{ width: '100%', mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, }}>
                {info}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <Btn variant="contained" color="error" endIcon={<DeleteRoundedIcon />} onClick={onClose} sx={{ height: '42px', mt: 1, justifySelf: 'end' }}>
                  {buttonText}
                </Btn>
              </Box>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal >
  );
}