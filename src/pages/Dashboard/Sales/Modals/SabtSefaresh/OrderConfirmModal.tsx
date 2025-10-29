import React, { useState } from 'react';

import {
  Modal,
  Box,
  IconButton,
  Tabs, Tab,
  Tooltip,
  SelectChangeEvent,
  Slide,
  Zoom,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import AddToOrderModal from '@/pages/Dashboard/Sales/Modals/AddToOrderModal';
import { flex, width, height } from '@/models/ReadyStyles';
import ProjectInfo from './ProjectInfo'
import ProductInfo from './ProductInfo'
import OrderConfirm from './OrderConfirm'
import { TransportItem } from '@/models'

interface SaleModalProps {
  open: boolean;
  onClose: () => void;
  isClosing?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
export default function SabtKalaModal({ open, onClose }: SaleModalProps) {
  const [value, setValue] = React.useState(0);
  const [addToOrderModalOpen, setAddToOrderModalOpen] = React.useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportItem | null>(null);

  const handleCloseAddToOrderModal = () => {
    if (addToOrderModalOpen === true) {
      setAddToOrderModalOpen(!addToOrderModalOpen);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          timeout: 150,
        },
      }}
    >
      <Slide in={open} direction='up'>
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            width: '700px',
            minHeight: '680px',
            margin: '-340px 0 0 -350px',
            backgroundColor: 'background.paper',
            background: 'linear-gradient(-165deg, #00ff684d, var(--transparent) 75%)',
            border: 'none',
            boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
            p: '20px',
            borderRadius: '20px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            
            '&:focus-visible': {
              outline: 'none'
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab label="ثبت سفارش" />
              <Tab label="اطلاعات پروژه" />
              <Tab label="جزئیات محصول" />
            </Tabs>
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
          <CustomTabPanel value={value} index={0}>
            <Zoom in={value === 0}>
              <Box sx={{ ...height.full, ...flex.justifyStart, flex: 1 }}>
                <OrderConfirm
                  selectedTransport={selectedTransport}
                  setSelectedTransport={setSelectedTransport}
                />
              </Box>
            </Zoom>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Zoom in={value === 1}>
              <Box sx={{ ...height.full, ...flex, alignItems: 'start' }}>
                <ProjectInfo />
              </Box>
            </Zoom>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <Zoom in={value === 2}>
              <Box>
                <ProductInfo />
              </Box>
            </Zoom>
          </CustomTabPanel>
          <AddToOrderModal
            open={addToOrderModalOpen}
            onClose={handleCloseAddToOrderModal}
          />
        </Box>
      </Slide>
    </Modal>
  );
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <>
      {value === index && (
        <>
          {children}
        </>
      )}
    </>
  );
}