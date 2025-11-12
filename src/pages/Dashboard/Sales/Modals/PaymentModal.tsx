import React from 'react';

import {
  Alert,
  Typography,
  Modal,
  Box,
  IconButton,
  Tooltip,
  TextField, InputAdornment,
  Button,
  Slide, Zoom, Grow,
  Backdrop,
  Paper,
  Divider,
  Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, tableCellClasses,
  styled,
  Menu, MenuItem, MenuList,
  Chip,

} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

import CloseIcon from '@mui/icons-material/Close';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import RefreshIcon from '@mui/icons-material/Refresh';

import usePersianNumbers from '@/hooks/usePersianNumbers';
import NumberField from '@/components/elements/NumberField';
import { flex, width, height, size, gap } from '@/models/ReadyStyles';
import Combo from '@/components/elements/Combo';
import { toPersianDigits } from '@/utils/persianNumbers';
import { TomanIcon, RialIcon } from '@/components/elements/TomanIcon';
import { useThemeMode } from '@/contexts/ThemeContext';
import Btn from '@/components/elements/Btn';

import {
  sampleCash,
  sampleCheque,
  sampleItems,
  accountNames,
  paymentMethods,
  paymentOrgs,
  dummyAccounts,
  dummyProjects,
  items, models,

} from '@/samples/payment';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  maxWidth: '100px'
}));

export function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      hidden={value !== index}
      sx={{
        display: value === index ? 'block' : 'none',
        height: '100%'
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
export function CashIncomes(props: any) {
  const { fullscreen } = props;
  return (
    <Box className='income-modal-table-container'>
      <TableContainer
        className='income-modal-table'
        sx={{
          maxHeight: fullscreen ? '100%' : '310px',
          overflow: 'auto'
        }}
      >
        <Table>
          <TableHead>
            <TableRow className='income-modal-table-header' >
              <StyledTableCell width={10}>ردیف</StyledTableCell>
              <StyledTableCell>زمان</StyledTableCell>
              <StyledTableCell>مبلغ</StyledTableCell>
              <StyledTableCell>درگاه</StyledTableCell>
              <StyledTableCell>کد پیگیری</StyledTableCell>
              <StyledTableCell>وضعیت</StyledTableCell>
              <StyledTableCell>توضیحات</StyledTableCell>
              <StyledTableCell>ثبت کننده</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleCash.map((row, index) => (
              <TableRow key={index} className='income-modal-table-rows' onClick={() => console.log(row)}>
                <StyledTableCell width={10} align='center'>{index + 1}</StyledTableCell>
                <TableCell>{row.time}</TableCell>
                <StyledTableCell>{row.amount}</StyledTableCell>
                <TableCell>{row.organization}</TableCell>
                <StyledTableCell>{row.code}</StyledTableCell>
                <StyledTableCell>{row.status}</StyledTableCell>
                <StyledTableCell>{row.details}</StyledTableCell>
                <TableCell>{row.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
export function ChequeIncomes(props: any) {
  const { fullscreen } = props;
  return (
    <Box className='income-modal-table-container'>
      <TableContainer
        className='income-modal-table'
        sx={{
          maxHeight: fullscreen ? '100%' : '310px',
          overflowY: 'auto', overflowX: 'none'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow className='income-modal-table-header' >
              <StyledTableCell width={10} >ردیف</StyledTableCell>
              <StyledTableCell>ثبت کننده</StyledTableCell>
              <StyledTableCell>توضیحات</StyledTableCell>
              <StyledTableCell>شماره حساب</StyledTableCell>
              <StyledTableCell>نام حساب</StyledTableCell>
              <StyledTableCell>شعبه</StyledTableCell>
              <StyledTableCell>بانک</StyledTableCell>
              <StyledTableCell>شماره چک</StyledTableCell>
              <StyledTableCell>مبلغ</StyledTableCell>
              <StyledTableCell>زمان</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleCheque.map((row, index) => (
              <TableRow key={index} className='income-modal-table-rows'>
                <StyledTableCell width={10} align='center' >{index + 1}</StyledTableCell>
                <StyledTableCell>{row.name}</StyledTableCell>
                <StyledTableCell>{row.details}</StyledTableCell>
                <StyledTableCell>{row.accountNumber}</StyledTableCell>
                <TableCell>{row.accountName}</TableCell>
                <StyledTableCell>{row.branch}</StyledTableCell>
                <StyledTableCell>{row.bank}</StyledTableCell>
                <StyledTableCell>{row.checkNumber}</StyledTableCell>
                <StyledTableCell>{row.amount}</StyledTableCell>
                <TableCell>{row.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
export function AddChequeModal({ open, onClose }: any) {
  const [chequeAmount, setChequeAmount] = React.useState('');
  const [chequeDate, setChequeDate] = React.useState<Dayjs | null>(dayjs());
  const { toPersianPrice } = usePersianNumbers();

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 150 } }}
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
            pointerEvents: 'none'
          }}
        >
          <Box
            sx={{
              width: '750px',
              bgcolor: 'background.paper',
              background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
              borderRadius: '25px',
              p: '15px',
              boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto'
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon />
                ایجاد / اصلاح دریافت چک جدید
              </Typography>
              <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                <IconButton onClick={onClose} color="error">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Form Fields */}
            <Box sx={{ ...flex.row, gap: '10px', mb: 2 }}>
              <Box sx={{ ...flex.row, ...flex.alignCenter, gap: '10px' }}>
                <TextField label="قسمت راست شماره" sx={{ flex: 0.5 }} />
                /
                <TextField label="قسمت چپ شماره" sx={{ flex: 0.5 }} />
              </Box>
              <DatePicker
                sx={{ flexGrow: 1 }}
                label='تاریخ چک'
                value={chequeDate}
                onChange={(newValue) => setChequeDate(newValue)}
              />
            </Box>
            <Box sx={{ ...flex.row, gap: 1, mb: 2 }}>
              <TextField label="نام بانک" sx={{ flex: 0.5 }} />
              <TextField label="شعبه بانک" sx={{ flex: 0.5 }} />
            </Box>
            <Box sx={{ ...flex.row, gap: 1, mb: 2 }}>
              <TextField label="نام حساب چک" sx={{ flex: 0.5 }} />
              <TextField label="شماره حساب چک" sx={{ flex: 0.5 }} />
            </Box>
            <Box sx={{ ...flex.row, gap: 1, mb: 2 }}>
              <TextField
                label="مبلغ"
                value={toPersianPrice(chequeAmount)}
                onChange={(e) => setChequeAmount(e.target.value)}
                sx={{ flex: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><RialIcon size={28} /></InputAdornment>
                }}
              />
            </Box>
            <TextField
              label="توضیحات"
              multiline
              rows={3}
              fullWidth
            />

            {/* Action Buttons */}
            <Box sx={{ ...flex.row, gap: 1, pt: 2, ...height.full, ...flex.alignEnd }}>
              <Btn variant="contained" color="success" sx={{ height: 44, width: 80 }}>
                تأیید
              </Btn>
              <Btn variant="contained" color="error" sx={{ height: 44, width: 100 }}>
                انصراف
              </Btn>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
}
export function AddPayModal({ open, onClose }: any) {
  const [paymentOrg, setPaymentOrg] = React.useState<string[]>([]);
  const [orderFullPrice, setOrderFullPrice] = React.useState('1200000');
  const { toPersianPrice } = usePersianNumbers();

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
              width: '600px',
              height: '360px',
              bgcolor: 'background.paper',
              background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
              border: 'none',
              boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
              p: '15px 15px',
              borderRadius: '25px',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              transition: 'all 0.3s ease',
              '&:focus-visible': {
                outline: 'none'
              },
              pointerEvents: 'auto'
            }}
          >
            {/* Control Panel */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1
              }}
            >
              <Typography variant='h6' sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <ReceiptLongIcon />
                اصلاح دریافت نقد
              </Typography>
              <Box>
                <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                  <IconButton
                    onClick={onClose}
                    color='error'
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ ...flex.row, gap: '10px', mb: 1 }}>
              <Combo
                label='شیوه پرداخت'
                value={paymentOrg}
                options={paymentOrgs}
                onChange={setPaymentOrg}
                sx={{ flex: 0.7 }}
              />
              <TextField
                id="order-final-number"
                label="مبلغ"
                variant="outlined"
                value={toPersianPrice(orderFullPrice)}
                onChange={(e) => setOrderFullPrice(e.target.value)}
                sx={{ flex: 0.35 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><RialIcon size={28} /></InputAdornment>
                }}
              />
            </Box>
            <TextField
              id="order-final-number"
              label="توضیحات"
              variant="outlined"
              multiline
              rows={5}
            />
            <Box sx={{ ...flex.row, gap: '10px', pt: 1, ...height.full, ...flex.alignEnd }}>
              <Btn variant="contained" color="success" sx={{ height: '44px', width: '80px' }}>
                تأیید
              </Btn>
              <Btn variant="contained" color="error" sx={{ height: '44px', width: '100px' }}>
                انصراف
              </Btn>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal >
  );
}
export function OrderEditModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [parcelTab, setParcelTab] = React.useState(0);
  // Change subTab to an object to track each parcel's subTab separately
  const [subTabs, setSubTabs] = React.useState<{ [key: number]: number }>({
    0: 0,
    1: 0
  });
  const [accountName, setAccountName] = React.useState<string[]>([]);
  const [chequeDate, setChequeDate] = React.useState<Dayjs | null>(dayjs());
  const [accountProjectModal, setAccountProjectModal] = React.useState(false);
  const [itmeEditModal, setItmeEditModal] = React.useState(false);

  const handleSubTabChange = (parcelIndex: number) => (event: React.SyntheticEvent, newValue: number) => {
    setSubTabs(prev => ({
      ...prev,
      [parcelIndex]: newValue
    }));
  };

  return (
    <React.Fragment>
      <Modal open={open} onClose={onClose} closeAfterTransition>
        <Slide in={open} direction="up">
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                width: '95vw',
                maxWidth: '900px',
                bgcolor: 'background.paper',
                background: 'linear-gradient(-165deg, #00ff684d, var(--transparent) 75%)',
                borderRadius: '25px',
                p: 2,
                boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
                pointerEvents: 'auto',
                overflow: 'auto',
                maxHeight: '95vh',
                
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  اصلاح سفارش | فروش حضوری
                </Typography>
                <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }}>
                  <IconButton onClick={onClose} color="error">
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ ...flex.rowStart, mb: 2, gap: '10px' }}>
                <DatePicker
                  label='تاریخ'
                  value={chequeDate}
                  onChange={(newValue) => setChequeDate(newValue)}
                  sx={{ width: '180px' }}
                />
                <TextField label="شماره سفارش" value="۵۲۷۳۳" sx={{ width: '180px' }} />
              </Box>

              <Box sx={{ ...flex.rowBetween, ...width.full, ...gap.fifteen, mb: 2 }}>
                <Box sx={{ ...flex.columnCenter, ...width.half, ...gap.fifteen }}>
                  <Combo
                    label='پروژه / مشتری'
                    value={accountName}
                    options={accountNames}
                    onChange={setAccountName}
                    menu={true}
                    menuItems={[
                      {
                        label: 'جزئیات حساب',
                        icon: <TuneRoundedIcon />,
                        onClick: () => setAccountProjectModal(true),
                      },
                    ]}
                    sx={{ width: '100%' }}
                  />
                  <TextField label="توسط" sx={{ ...width.full }} />
                </Box>
                <Box>
                  <Divider orientation='vertical' sx={{ height: '100%' }} />
                </Box>
                <Box sx={{ ...flex.columnCenter, ...width.half, ...gap.fifteen }}>
                  <TextField label="ادامه آدرس" value="سیو کوچیک، مهدی خندان" sx={{ ...width.full }} />
                  <Box sx={{ ...flex.row, ...width.full, ...gap.ten }}>
                    <TextField label="تحویل گیرنده" sx={{ flex: 1 }} />
                    <TextField label="شماره تحویل گیرنده" sx={{ flex: 1 }} />
                  </Box>
                </Box>
              </Box>

              {/* Parent Tabs for Parcels */}
              <Box sx={{ ...flex.rowStart, pb: 1, backgroundColor: 'background.overlay', borderRadius: '16px 36px 0 0' }}>
                <Tabs value={parcelTab} onChange={(_, v) => setParcelTab(v)}>
                  <Tab label="مرسوله شماره ۱" />
                  <Tab label="مرسوله شماره ۲" />
                </Tabs>
              </Box>

              {/* Child Tabs - This will show the sub-tabs for the currently selected parcel */}
              <Box sx={{ ...flex.rowStart, mb: 2, backgroundColor: 'background.overlay' }}>
                <Tabs
                  value={subTabs[parcelTab]}
                  onChange={handleSubTabChange(parcelTab)}
                  sx={{ width: 300 }}
                >
                  <Tab label="کالاها" />
                  <Tab label="سایر اقلام" />
                </Tabs>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Btn color="warning" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setItmeEditModal(true)}>
                  ویرایش
                </Btn>
                <Btn color="error" variant="outlined" startIcon={<DeleteRoundedIcon />}>
                  حذف
                </Btn>
              </Box>

              {/* Content for each parcel */}
              {[0, 1].map((parcelIndex) => {
                const filteredItems = sampleItems.filter(item => item.shipmentId === parcelIndex + 1);

                return (
                  <Grow in={parcelTab === parcelIndex} key={parcelIndex}>
                    <Box>
                      {/* Content for "کالاها" tab */}
                      {subTabs[parcelIndex] === 0 && (
                        <Box>
                          {filteredItems.length > 0 && (
                            <Box className='income-modal-table-container'>
                              <TableContainer
                                className="income-modal-table"
                                sx={{
                                  maxHeight: '185px',
                                  overflow: 'auto'
                                }}
                              >
                                <Table stickyHeader>
                                  <TableHead>
                                    <TableRow className="income-modal-table-header">
                                      <TableCell>*</TableCell>
                                      <TableCell>نام کالا</TableCell>
                                      <TableCell>تعداد</TableCell>
                                      <TableCell>واحد کالا</TableCell>
                                      <TableCell>قیمت کالا</TableCell>
                                      <TableCell>تخفیف</TableCell>
                                      <TableCell>توضیحات</TableCell>
                                      <TableCell>فروشنده</TableCell>
                                      <TableCell>وضعیت</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {filteredItems.map((item, i) => (
                                      <TableRow key={item.id} className="income-modal-table-rows">
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.count}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell>{item.price.toLocaleString('fa-IR')}</TableCell>
                                        <TableCell>{item.discount.toLocaleString('fa-IR')}</TableCell>
                                        <TableCell>{item.details}</TableCell>
                                        <TableCell>{item.seller}</TableCell>
                                        <TableCell style={{ color: item.status === 'فعال' ? 'green' : 'red' }}>
                                          {item.status}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}
                          {filteredItems.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                              هیچ کالایی برای این مرسوله موجود نیست.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Content for "سایر اقلام" tab */}
                      {subTabs[parcelIndex] === 1 && (
                        <Box sx={{ p: 2 }}>
                          <Typography variant="h6">محتوای سایر اقلام برای مرسوله {parcelIndex + 1}</Typography>
                          {/* Add your content for "سایر اقلام" here */}
                        </Box>
                      )}

                      {/* Content for "سایر هزینه ها" tab */}
                    </Box>
                  </Grow>
                );
              })}

              <TextField
                label="توضیحات"
                multiline
                rows={3}
                fullWidth
                sx={{ mt: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Btn variant="contained" color="error" onClick={onClose}>
                  انصراف
                </Btn>
                <Btn variant="contained" color="success">
                  تأیید
                </Btn>
              </Box>

            </Box>
          </Box>
        </Slide>
      </Modal>
      <AccountProjectModal open={accountProjectModal} onClose={() => setAccountProjectModal(false)} />
      <ProductEditModal open={itmeEditModal} onClose={() => setItmeEditModal(false)} />
    </React.Fragment>
  );
}
export function AccountProjectModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [selectedAccount, setSelectedAccount] = React.useState<string | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<string | null>(null);

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Slide in={open} direction="up">
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              width: '95vw',
              maxWidth: '700px',
              bgcolor: 'background.paper',
              background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
              borderRadius: '25px',
              p: 2,
              boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
              pointerEvents: 'auto',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              gap: '15px'
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">ایجاد / اصلاح حساب یا پروژه</Typography>
              <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                <IconButton onClick={onClose} color="error">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Combo Row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Account Column */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Combo
                  label="حساب"
                  value={selectedAccount}
                  options={dummyAccounts}
                  onChange={setSelectedAccount}
                  menu
                  menuItems={[
                    { label: 'افزودن حساب', icon: <AddIcon color='success' />, onClick: () => console.log('افزودن حساب') },
                    { label: 'ویرایش حساب', icon: <EditRoundedIcon color='info' />, onClick: () => console.log('ویرایش حساب') },
                    { label: 'حذف حساب', icon: <DeleteRoundedIcon color='error' />, onClick: () => console.log('ویرایش پروژه') }
                  ]}
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* Project Column */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Combo
                  label="مرکز پروژه"
                  value={selectedProject}
                  options={dummyProjects}
                  onChange={setSelectedProject}
                  menu
                  menuItems={[
                    { label: 'افزودن پروژه', icon: <AddIcon color='success' />, onClick: () => console.log('افزودن پروژه') },
                    { label: 'ویرایش پروژه', icon: <EditRoundedIcon color='info' />, onClick: () => console.log('ویرایش پروژه') },
                    { label: 'حذف پروژه', icon: <DeleteRoundedIcon color='error' />, onClick: () => console.log('ویرایش پروژه') }
                  ]}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn variant="contained" color="primary" onClick={onClose}>
                بستن
              </Btn>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
}
export function ProductEditModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState<string>('0');
  const [price, setPrice] = React.useState<string>('');
  const [discount, setDiscount] = React.useState<string>('');


  const handleOnlyDigits =
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value.replace(/[^\d]/g, ''));
    };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Slide in={open} direction="up">
        <Box
          sx={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'absolute', pointerEvents: 'none'
          }}
        >
          <Box
            sx={{
              width: '95vw',
              maxWidth: '800px',
              bgcolor: 'background.paper',
              background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
              borderRadius: '25px',
              p: 2,
              boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
              pointerEvents: 'auto',
              overflow: 'auto',
              maxHeight: '95vh'
            }}
          >
            {/* Header */}
            <Box sx={{ ...flex.rowBetween, mb: 2 }}>
              <Typography variant="h6">اصلاح کالا</Typography>
              <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                <IconButton onClick={onClose} color="error">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* انتخاب کالا / مدل کالا */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ ...flex.row, gap: '8px' }}>
                <Combo
                  label="کالا"
                  value={selectedItem}
                  options={items}
                  onChange={setSelectedItem}
                  sx={{ width: '100%' }}
                />


              </Box>
              <Alert severity="warning" variant="outlined" sx={{ mt: 2, borderRadius: '12px' }}>
                به‌روزرسانی قیمت، با توجه به شیوه حمل، انبار، آدرس سفارش و تأمین‌کننده انتخاب‌شده پردازش می‌شود.
              </Alert>
            </Paper>

            {/* جزئیات سفارش */}

            <Box sx={{ p: 2, mb: 1 }}>

              <Box sx={{ ...flex.row, ...width.full, ...gap.ten }}>
                <Box sx={{ ...width.half, ...flex.columnBetween, ...height.full, ...gap.ten }}>
                  <Typography variant="subtitle2" sx={{ pl: 1 }}>
                    جزئیات سفارش
                  </Typography>
                  <NumberField
                    label="تعداد"
                    value={qty}
                    onChange={setQty}
                    fullWidth
                  />
                  <Combo
                    label="واحد کالا"
                    value={selectedModel}
                    options={models}
                    onChange={setSelectedModel}
                    sx={{ width: '100%' }}
                  />
                </Box>
                <Box sx={{ ...width.half, ...flex.columnBetween, ...height.full, ...gap.ten }}>
                  <Typography variant="subtitle2" sx={{ pl: 1 }}>
                    تامین‌کننده
                  </Typography>
                  <TextField
                    label="قیمت"
                    value={price}
                    onChange={handleOnlyDigits(setPrice)}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><RialIcon size={28} /></InputAdornment>
                    }}
                  />
                  <TextField
                    label="تخفیف"
                    value={discount}
                    onChange={handleOnlyDigits(setDiscount)}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><RialIcon size={28} /></InputAdornment>
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* توضیحات */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, pl: 1 }}>
                توضیحات
              </Typography>
              <TextField multiline rows={3} fullWidth />
            </Box>

            {/* Footer */}
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ ...flex.rowEnd, gap: '10px' }}>
              <Btn variant="contained" color="success">تایید</Btn>
              <Btn variant="contained" color="error" onClick={onClose}>انصراف</Btn>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
}
export default function PaymentModal({ open, onClose, receiptNumber }: { open: boolean, onClose: () => void, receiptNumber?: number }) {
  const [fullScreen, setFullScreen] = React.useState(false);
  const [addPayOpen, setAddPayOpen] = React.useState(false);
  const [addChequeOpen, setAddChequeOpen] = React.useState(false);
  const [orderEditModalOpen, setOrderEditModalOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string[]>([]);
  const [orderFullPrice, setOrderFullPrice] = React.useState('1200000');
  const { toPersianPrice } = usePersianNumbers();
  const [value, setValue] = React.useState(0);
  const [OrderAnchorEl, setOrderAnchorEl] = React.useState<null | HTMLElement>(null);
  const printMenuOpen = Boolean(OrderAnchorEl);

  const handlePrintToggle = () => {
    setOrderAnchorEl(null);
  };

  const handleOrderPrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOrderAnchorEl(event.currentTarget);
  };

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
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: fullScreen ? 'calc(100vw - 50px)' : '1100px',
                height: fullScreen ? 'calc(100vh - 50px)' : '680px',
                bgcolor: 'background.paper',
                background: 'linear-gradient(-165deg, #00ff684d, var(--background-paper) 75%)',
                border: 'none',
                boxShadow: 'inset 0 0 10px 1px rgba(255, 255, 255, 0.2), 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
                p: '15px 15px',
                borderRadius: '25px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease',
                '&:focus-visible': {
                  outline: 'none'
                },
                pointerEvents: 'auto',
              }}
            >
              {/* Control Panel */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}
              >
                <Typography variant='h6' sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <ReceiptLongIcon />
                  رسید دریافت شماره:
                  {receiptNumber}
                </Typography>
                <Box>
                  <IconButton
                    onClick={() => setFullScreen(!fullScreen)}
                    color='default'
                  >
                    {
                      fullScreen
                        ? <CloseFullscreenRoundedIcon />
                        : <OpenInFullRoundedIcon />
                    }
                  </IconButton>
                  <Tooltip title="بستن" placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
                    <IconButton
                      onClick={onClose}
                      color='error'
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {/* Header */}
              <Box sx={{ ...flex.rowStart, gap: '15px' }} >
                <Combo
                  label='شیوه پرداخت'
                  value={paymentMethod}
                  options={paymentMethods}
                  onChange={setPaymentMethod}
                  sx={{ ...flex.one }}
                />
                <Divider orientation="vertical" variant="middle" flexItem />
                <Box sx={{ ...flex.one, ...flex.row, ...flex.alignCenter, ...width.full, gap: '10px' }}>
                  <TextField
                    id="order-final-number"
                    label="مبلغ فاکتور"
                    variant="standard"
                    disabled
                    value={toPersianPrice(orderFullPrice)}
                    onChange={(e) => setOrderFullPrice(e.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><RialIcon size={28} /></InputAdornment>
                    }}
                  />
                </Box>
                <Box sx={{ ...flex.one, ...flex.row, ...flex.alignCenter, ...width.full, gap: '10px' }}>
                  <TextField
                    id="order-final-discount"
                    label="تخفیف نهایی "
                    variant="standard"
                    // type="number"
                    value={orderFullPrice}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setOrderFullPrice(value);
                      toPersianPrice(value);
                    }}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><RialIcon size={28} /></InputAdornment>
                    }}
                  />
                </Box>
                <Box sx={{ ...flex.one, ...flex.row, ...flex.alignCenter, ...width.full, gap: '10px' }}>
                  <TextField
                    id="order-final-number"
                    label="قابل پرداخت"
                    variant="standard"
                    value={toPersianPrice(orderFullPrice)}
                    onChange={(e) => setOrderFullPrice(e.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><RialIcon size={28} /></InputAdornment>
                    }}
                  />
                </Box>
              </Box>
              {/* Body */}
              <Box sx={{ position: 'relative', p: 1, width: '100%', mt: 1, ...flex.columnAround, ...height.full }}>
                <Paper
                  sx={{
                    p: 2,
                    position: 'relative',
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    width: '100%',
                    background: 'transparent',
                    borderRadius: '16px',
                    ...height.full,
                    my: 1,
                    mt: 2
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
                      جزئیات پرداخت های نقد
                    </Typography>
                  </Box>
                  <Box sx={{ ...width.full, ...flex.center }} >
                    <Tabs
                      orientation="horizontal"
                      variant="fullWidth"
                      value={value}
                      onChange={(event, newValue) => setValue(newValue)}
                      sx={{ width: '280px' }}
                    >
                      <Tab label="دریافت های نقد" iconPosition='start' />
                      <Tab label="دریافت های چک" iconPosition='start' />
                    </Tabs>
                  </Box>
                  <Box sx={{ ...width.full, ...flex.row, height: '44px', gap: '10px' }}>
                    <Btn color='success' variant='outlined' startIcon={<AddIcon />} sx={{ width: '100px' }}
                      onClick={
                        value === 1
                          ? () => setAddChequeOpen(true)
                          : () => setAddPayOpen(true)
                      }
                    >
                      افزودن
                    </Btn>
                    <Btn color='info' variant='outlined' startIcon={<EditRoundedIcon />} sx={{ width: '100px' }}>
                      ویرایش
                    </Btn>
                    <Btn color='error' variant='outlined' startIcon={<DeleteRoundedIcon />} sx={{ width: '100px' }}>
                      حذف
                    </Btn>
                  </Box>
                  <Grow in={value === 0} >
                    <TabPanel className='sales-tab-panel' value={value} index={0}>
                      <CashIncomes fullscreen={fullScreen} />
                    </TabPanel>
                  </Grow>
                  <Grow in={value === 1} >
                    <TabPanel className='sales-tab-panel' value={value} index={1}>
                      <ChequeIncomes fullscreen={fullScreen} />
                    </TabPanel>
                  </Grow>
                </Paper>
              </Box>
              <Box sx={{ ...flex.row, gap: '10px', px: 1 }}>

                <Btn variant="contained" color="info" startIcon={<EditRoundedIcon />} onClick={() => setOrderEditModalOpen(true)} sx={{ width: '100px' }}>
                  ویرایش
                </Btn>
                <Btn variant="contained" color="info" startIcon={<LocalPrintshopRoundedIcon />} sx={{ width: '100px' }} onClick={handleOrderPrintClick}>
                  چاپ
                </Btn>
                <Menu
                  id="basic-menu"
                  anchorEl={OrderAnchorEl}
                  open={printMenuOpen}
                  onClose={handlePrintToggle}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  sx={{
                    '& .MuiList-dense ': {
                      paddingTop: '0 !important',
                      paddingBottom: '0 !important'
                    }
                  }}
                >
                  <MenuList
                    dense
                    sx={{
                      '& .MuiMenuItem-root':
                      {
                        paddingTop: '6px',
                        paddingBottom: '6px'
                      },
                    }}
                  >

                    <MenuItem onClick={handlePrintToggle} sx={{ ...flex.rrowBetween }}>
                      <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                      <Typography variant="subtitle2">چاپ فاکتور مشتری</Typography>
                    </MenuItem>
                    <MenuItem onClick={handlePrintToggle} sx={{ ...flex.rrowBetween }}>
                      <LocalPrintshopRoundedIcon color='info' sx={{ ml: 2 }} />
                      <Typography variant='subtitle2'>چاپ فاکتور حسابداری</Typography>
                    </MenuItem>
                    <MenuItem onClick={handlePrintToggle} sx={{ ...flex.rrowBetween }}>
                      <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                      <Typography variant="subtitle2">چاپ فاکتور حسابداری و مشتری</Typography>
                    </MenuItem>
                    <MenuItem onClick={handlePrintToggle} sx={{ ...flex.rrowBetween }}>
                      <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                      <Typography variant="subtitle2">چاپ همه حواله های انبار</Typography>
                    </MenuItem>
                    <MenuItem onClick={handlePrintToggle} sx={{ ...flex.rrowBetween }}>
                      <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                      <Typography variant="subtitle2">چاپ همه</Typography>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Box>
          </Box>
        </Slide>
      </Modal >
      <AddPayModal open={addPayOpen} onClose={() => setAddPayOpen(false)} />
      <AddChequeModal open={addChequeOpen} onClose={() => setAddChequeOpen(false)} />
      <OrderEditModal open={orderEditModalOpen} onClose={() => setOrderEditModalOpen(false)} />
    </React.Fragment>
  );
}