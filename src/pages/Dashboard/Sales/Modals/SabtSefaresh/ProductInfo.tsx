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
import { flex } from '@/models/ReadyStyles';
import { getInventory } from '@/api';
import { Inventory } from '@/models';
import { useProductsStore, useOrgansStore } from '@/stores'; 

export default function ProductInfo(props: any) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flex: '1'
      }}
    >
      <h2>جزئیات محصول</h2>
    </Box>
  )
}