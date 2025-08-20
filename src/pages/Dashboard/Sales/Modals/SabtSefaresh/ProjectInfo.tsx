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

export default function ProjectInfo(props: any) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'start'
      }}
    >
      <h2>اطلاعات پروژه</h2>
      <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: 'row', height: '150px', mt: 1 }} >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'start',
            p: 1,
            flex: 1,
          }}
        >
          <Typography variant="h6"> نام پروژه </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '12px',
            border: '1px solid var(--text-disabled)',
            flex: 1,
          }}
        >
          <LocationPinIcon />
        </Box>
      </Box>
    </Box>
  )
}