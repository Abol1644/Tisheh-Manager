import React from 'react';

import {
  Typography,
  Modal,
  Box,
  IconButton,
  Tooltip,
  Slide,
  Backdrop,
  Zoom
} from '@mui/material';

import Btn from '@/components/elements/Btn';
import CloseIcon from '@mui/icons-material/Close';
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";

import { findProject, connectProject } from '@/api';
import { useProjectStore, useAccountStore } from '@/stores';
import { useSnackbar } from '@/contexts/SnackBarContext';

export default function ConnectProjectModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { selectedProject } = useProjectStore();
  const { selectedAccount } = useAccountStore();
  const { showSnackbar } = useSnackbar();

  const handleConnectProject = () => {
    showSnackbar('connecting', 'success');
    if (selectedProject && selectedAccount) {
      connectProject(selectedProject, selectedAccount).then(() => {
        showSnackbar('پروژه با موفقیت متصل شد', 'success');
        onClose();
      }).catch((error) => {
        console.error('Error connecting project:', error);
        showSnackbar('متصل کردن پروژه ناموفق بود', 'error');
      });
    } else {
      showSnackbar('پروژه یا حساب انتخاب نشده است', 'error');
    }
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
                <AddLinkRoundedIcon />
                اتصال پروژه به حساب
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
                آیا میخواهید پروژه به حساب متصل شود؟
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <Btn variant="contained" color="error" endIcon={<AddLinkRoundedIcon />} onClick={handleConnectProject} sx={{ height: '42px', mt: 1, justifySelf: 'end' }}>
                  اتصال
                </Btn>
              </Box>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal >
  );
}