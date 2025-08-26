import React from 'react';

import {
  Typography,
  Modal,
  Box,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Slide, Collapse, Grow, Zoom,
  Backdrop,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  FormControl, Menu, MenuItem, MenuList, InputLabel,
  Accordion, AccordionActions, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, tableCellClasses, tableRowClasses,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import AddLinkRoundedIcon from '@mui/icons-material/AddLinkRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import Btn from '@/components/elements/Btn';
import { flex, width, height, gap } from '@/models/ReadyStyles';
import PhoneField from '@/components/elements/PhoneField';
import { useThemeMode } from '@/contexts/ThemeContext';

export const rows = [
  {
    id: 1,
    orderIdCode: 'ORD-1001',
    orderTime: '1403/04/01 10:30',
    customer: 'علی رضایی',
    orderMethod: 'آنلاین',
    wearhouse: 'انبار مرکزی'
  },
  {
    id: 2,
    orderIdCode: 'ORD-1002',
    orderTime: '1403/04/02 12:15',
    customer: 'مریم احمدی',
    orderMethod: 'حضوری',
    wearhouse: 'انبار غرب'
  },
  {
    id: 3,
    orderIdCode: 'ORD-1003',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 4,
    orderIdCode: 'ORD-10401',
    orderTime: '1403/04/01 10:30',
    customer: 'علی رضایی',
    orderMethod: 'آنلاین',
    wearhouse: 'انبار مرکزی'
  },
  {
    id: 5,
    orderIdCode: 'ORD-10502',
    orderTime: '1403/04/02 12:15',
    customer: 'مریم احمدی',
    orderMethod: 'حضوری',
    wearhouse: 'انبار غرب'
  },
  {
    id: 6,
    orderIdCode: 'ORD-12003',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 7,
    orderIdCode: 'ORD-10051',
    orderTime: '1403/04/01 10:30',
    customer: 'علی رضایی',
    orderMethod: 'آنلاین',
    wearhouse: 'انبار مرکزی'
  },
  {
    id: 8,
    orderIdCode: 'ORD-10026',
    orderTime: '1403/04/02 12:15',
    customer: 'مریم احمدی',
    orderMethod: 'حضوری',
    wearhouse: 'انبار غرب'
  },
  {
    id: 9,
    orderIdCode: 'ORD-10037',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 10,
    orderIdCode: 'ORD-10038',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 11,
    orderIdCode: 'ORD-10039',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 12,
    orderIdCode: 'ORD-100399',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 13,
    orderIdCode: 'ORD-99',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 14,
    orderIdCode: 'ORD-100893',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 15,
    orderIdCode: 'ORD-1006783',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  },
  {
    id: 16,
    orderIdCode: 'ORD-1056703',
    orderTime: '1403/04/03 09:45',
    customer: 'حسین موسوی',
    orderMethod: 'تلفنی',
    wearhouse: 'انبار شرق'
  }
];

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

function Row(props: { row: any, index: number }) {
  const { row, index } = props;
  const [open, setOpen] = React.useState(false);
  const [number, setNumber] = React.useState<string[]>([]);
  const [OrderAnchorEl, setOrderAnchorEl] = React.useState<null | HTMLElement>(null);
  const [shipmentAnchorEl, setShipmentAnchorEl] = React.useState<null | HTMLElement>(null);
  const orderPrintMenuOpen = Boolean(OrderAnchorEl);
  const shipmentPrintMenuOpen = Boolean(shipmentAnchorEl);

  const handleOrderPrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOrderAnchorEl(event.currentTarget);
  };

  const handleShipmentPrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShipmentAnchorEl(event.currentTarget);
  };

  const handleOrderPrintToggle = () => {
    setOrderAnchorEl(null);
  };

  const handleShippmentPrintToggle = () => {
    setShipmentAnchorEl(null);
  };

  return (
    <React.Fragment>
      <TableRow
        className={`order-row ${index % 2 === 0 ? 'even' : 'odd'}${open ? ' open' : ''}`}
        hover
        sx={{ 
          '& .MuiTableCell-root': {
            padding: '8px',
          }
        }}
      >
        <TableCell align='center'>
          {index + 1}
        </TableCell>

        <TableCell component="th">
          <Box sx={{ ...flex.rowBetween }}>
            {row.orderIdCode}
            <Box sx={{ ...flex.rowBetween, ...gap.ten }}>
              <Btn variant="contained" color="secondary" startIcon={<AddLinkRoundedIcon />} height={40} sx={{ px: 3 }}>
                ارتباط
              </Btn>
              <Btn variant="contained" color="info" startIcon={<TuneRoundedIcon />} height={40} sx={{ px: 3 }}>
                جزئیات
              </Btn>
            </Box>
          </Box>
        </TableCell>

      </TableRow>
    </React.Fragment >
  );
}

export default React.memo(function ConnectToProject({ open, onClose }: ModalProps) {
  const { mode } = useThemeMode()

  return (
    <React.Fragment>
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
                width: '800px',
                height: 'auto',
                bgcolor: 'background.paper',
                background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
                border: 'none',
                boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
                p: '20px 20px',
                borderRadius: '25px',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                '&:focus-visible': {
                  outline: 'none'
                },
                pointerEvents: 'auto',
                overflowX: 'hidden'
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
                  <AddLinkRoundedIcon />
                  ارتباط با پروژه های باز
                </Typography>
                <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                  <IconButton
                    aria-label="بستن"
                    onClick={onClose}
                    color='error'
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ position: 'relative', width: '100%', mt: 1 }}>
                <TableContainer
                  sx={{
                    overflow: 'auto',
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none',
                    borderWidth: '2px 2px 1px 2px',
                    borderStyle: 'solid',
                    borderColor: mode === 'light' ? '#D1D1D1' : '#616161',
                    borderRadius: '16px',
                    maxHeight: '400px'
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow hover
                        sx={{
                          '& .MuiTableCell-root': {
                            backgroundColor: 'var(--table-header) !important'
                          }
                        }}
                      >
                        <TableCell align='center' width={10}>ردیف</TableCell>
                        <TableCell>کد سفارش</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className='table-body-rows'>
                      {rows.map((row, index) => (
                        <Row
                          key={row.orderIdCode}
                          row={row}
                          index={index}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ ...flex.rowEnd, gap: '10px', pt: 1, ...height.full, ...flex.alignEnd }}>
                  <Btn variant="contained" color="error" sx={{ height: '44px', width: '100px' }} onClick={onClose}>
                    انصراف
                  </Btn>
                </Box>
              </Box>
            </Box>
          </Box>
        </Slide>
      </Modal>
    </React.Fragment>
  );
});