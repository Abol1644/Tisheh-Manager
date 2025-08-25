import React, { useState } from 'react';

import {
  Typography,
  Modal,
  Box,
  IconButton,
  Tabs, Tab,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  MenuItem,
  FormControl,
  Select, SelectChangeEvent,
  OutlinedInput,
  Slide, Backdrop,
  Zoom,
} from '@mui/material';

import Btn, { BtnGroup } from '@/components/elements/Btn';

const MemoizedModal = React.memo(Modal);
const MemoizedBackdrop = React.memo(Backdrop);

import NumberField from '@/components/elements/NumberField';
import { useThemeMode } from '@/contexts/ThemeContext';

import CloseIcon from '@mui/icons-material/Close';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import TimerIcon from '@mui/icons-material/Timer';

import { TomanIcon, RialIcon } from '@/components/elements/TomanIcon';

import usePersianNumbers from '@/hooks/usePersianNumbers';
import AddToOrderModal from '@/pages/Dashboard/Sales/Modals/AddToOrderModal';
import { flex, width, height } from '@/models/ReadyStyles';
import { getInventory } from '@/api';
import { Inventory } from '@/models';
import { useProductsStore, useOrgansStore } from '@/stores';
import ProjectInfo from './ProjectInfo'
import ProductInfo from './ProductInfo'
import { OrderConfirm } from './OrderConfirm'


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
  const [listOpen, setListOpen] = React.useState(true);
  const [cart, setCart] = React.useState<string[]>([]);
  const [addToOrderModalOpen, setAddToOrderModalOpen] = React.useState(false);


  const handleCloseAddToOrderModal = () => {
    if (addToOrderModalOpen === true) {
      setAddToOrderModalOpen(!addToOrderModalOpen);
    }
  };

  const addToOrderClick = () => {
    setAddToOrderModalOpen(true)
  }

  const handleClick = () => {
    setListOpen(!listOpen);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCartChange = (event: SelectChangeEvent<typeof cart>) => {
    const {
      target: { value },
    } = event;
    setCart(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <MemoizedModal
      open={open}
      onClose={onClose}
      slots={{ backdrop: MemoizedBackdrop }}
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
            bgcolor: 'background.paper',
            background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
            border: 'none',
            boxShadow: 24,
            p: '20px',
            borderRadius: '20px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:focus-visible': {
              outline: 'none'
            }
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
                <OrderConfirm />
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
            <FormControl size='small' sx={{ minWidth: '200px', flex: 1 }}>
              <Select
                displayEmpty
                value={cart}
                onChange={handleCartChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>سبد خرید</em>;
                  }
                  return selected.join(', ');
                }}
              >
                <MenuItem disabled value="">
                  <em>سبد خرید</em>
                </MenuItem>
                <MenuItem value={'سبد خرید جدید'}>سبد خرید جدید</MenuItem>
                <MenuItem value={'سبد خرید شماره 2'}>سبد خرید شماره 2</MenuItem>
              </Select>
            </FormControl>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'row' }}>
              <Btn onClick={addToOrderClick} color='info' variant="contained" sx={{ whiteSpace: 'nowrap' }}>
                افزودن به سفارش
              </Btn>
              <BtnGroup variant="contained" color='success'>
                <Btn color='success' variant="contained" sx={{ width: '70px' }}>
                  ثبت
                </Btn>
                <Btn color='success' variant="contained" sx={{ whiteSpace: 'nowrap' }}>
                  رفتن به سبد خرید
                </Btn>
              </BtnGroup>
            </div>
          </Box>
          <AddToOrderModal
            open={addToOrderModalOpen}
            onClose={handleCloseAddToOrderModal}
          />
        </Box>
      </Slide>
    </MemoizedModal>
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