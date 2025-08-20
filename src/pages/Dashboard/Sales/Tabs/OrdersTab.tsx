import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  alpha,
  Box,
  Drawer,
  Paper,
  Button,
  IconButton,
  Slide, Collapse, Grow, Zoom,
  Typography,
  Tooltip,
  Accordion, AccordionActions, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, tableCellClasses, tableRowClasses,
  TextField, Autocomplete,
  FormControl, Menu, MenuItem, MenuList, InputLabel,
  List, ListItem, ListItemButton, ListItemText,
  Select, SelectChangeEvent
} from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FmdGoodRoundedIcon from '@mui/icons-material/FmdGoodRounded';
import AddIcon from '@mui/icons-material/Add';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';

import { useThemeMode } from '@/contexts/ThemeContext';
import { flex, height, width, background } from '@/models/ReadyStyles';
import PageContainer from '@/components/PageContainer';
import usePersianNumbers from '@/hooks/usePersianNumbers';
import { persianDataGridLocale } from '@/components/datagrids/DataGridProps';
import NumberField from '@/components/elements/NumberField';
import DeleteModal from '@/pages/Dashboard/Sales/Modals/DeleteModal';
import Combo from '@/components/elements/Combo';
import Btn from '@/components/elements/Btn';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { styled } from '@mui/material/styles';

import { rows, orders, accs } from '@/samples/orderTabRows';
import { gridClasses } from '@mui/system';
import { toPersianDigits } from '@/utils/persianNumbers';

function Row(props: { row: any, index: number, deleteModal: boolean, setDeleteModal: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { row, index, deleteModal, setDeleteModal } = props;
  const [open, setOpen] = useState(false);
  const [number, setNumber] = React.useState<string[]>([]);
  const [OrderAnchorEl, setOrderAnchorEl] = React.useState<null | HTMLElement>(null);
  const [shipmentAnchorEl, setShipmentAnchorEl] = React.useState<null | HTMLElement>(null);
  const orderPrintMenuOpen = Boolean(OrderAnchorEl);
  const shipmentPrintMenuOpen = Boolean(shipmentAnchorEl);

  const handleDeleteToggle = () => {
    setDeleteModal(!deleteModal);
  };

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
      >
        <TableCell align='center'>
          {index + 1}
        </TableCell>

        <TableCell component="th" scope="row">
          {row.orderIdCode}
        </TableCell>

        <TableCell>
          {row.orderTime}
        </TableCell>

        <TableCell>
          {row.customer}
        </TableCell>

        <TableCell>
          {row.orderMethod}
        </TableCell>

        <TableCell>
          {row.wearhouse}
        </TableCell>

        <TableCell>
          پرداخت شده
        </TableCell>

        <TableCell align='center'>
          {row.wearhouse}
        </TableCell>

        <TableCell>
          {row.wearhouse}
        </TableCell>

        <TableCell>
          {row.wearhouse}
        </TableCell>

        <TableCell>
          <Box sx={{ ...flex.alignCenter, ...flex.justifyAround }}>
            <Tooltip title="پرینت سفارش" placement='top' arrow disableInteractive slots={{ transition: Zoom }} followCursor>
              <IconButton color="info" onClick={handleOrderPrintClick}>
                <LocalPrintshopRoundedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu"
              anchorEl={OrderAnchorEl}
              open={orderPrintMenuOpen}
              onClose={handleOrderPrintToggle}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
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
                <MenuItem onClick={handleOrderPrintToggle} sx={{ ...flex.rrowBetween }}>
                  <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                  <Typography variant="subtitle2">چاپ فاکتور مشتری</Typography>
                </MenuItem>
                <MenuItem onClick={handleOrderPrintToggle} sx={{ ...flex.rrowBetween }}>
                  <LocalPrintshopRoundedIcon color='info' sx={{ ml: 2 }} />
                  <Typography variant='subtitle2'>چاپ فاکتور حسابداری</Typography>
                </MenuItem>
                <MenuItem onClick={handleOrderPrintToggle} sx={{ ...flex.rrowBetween }}>
                  <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                  <Typography variant="subtitle2">چاپ فاکتور حسابداری و مشتری</Typography>
                </MenuItem>
                <MenuItem onClick={handleOrderPrintToggle} sx={{ ...flex.rrowBetween }}>
                  <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                  <Typography variant="subtitle2">چاپ همه حواله های انبار</Typography>
                </MenuItem>
                <MenuItem onClick={handleOrderPrintToggle} sx={{ ...flex.rrowBetween }}>
                  <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                  <Typography variant="subtitle2">چاپ همه</Typography>
                </MenuItem>
              </MenuList>
            </Menu>
            <Tooltip title="جزئیات سفارش" placement='top' arrow disableInteractive slots={{ transition: Zoom }} followCursor>
              <IconButton onClick={() => setOpen(!open)}>
                {
                  open
                    ?
                    <Zoom in={open} timeout={500}>
                      <ClearRoundedIcon color='error' />
                    </Zoom>
                    :
                    <Grow in={!open} timeout={500}>
                      <MenuOpenRoundedIcon color='info' />
                    </Grow>
                }
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>

      </TableRow>
      <Zoom in={open} timeout={400}>
        <TableRow className='table-row-collapse-open'>
          <TableCell className='table-row-collapse-cell' style={{ padding: 0 }} colSpan={11}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box className='shipments-table-container' sx={{ margin: 2 }}>
                <Table className='shipments-table'>
                  <TableHead>
                    <TableRow className='shipments-table-header'>
                      <TableCell align='center'>
                        کد مرسوله
                      </TableCell>
                      <TableCell>
                        کالا / خدمات
                      </TableCell>
                      <TableCell>
                        تعداد
                      </TableCell>
                      <TableCell>
                        شیوه تحویل
                      </TableCell>
                      <TableCell>
                        زمان تحویل
                      </TableCell>
                      <TableCell>
                        وضعیت مرسوله
                      </TableCell>
                      <TableCell>
                        توضیحات
                      </TableCell>
                      <TableCell align='center'>
                        چاپ
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className='shipments-table-body'>
                    {orders.map((order) => (
                      <TableRow key={order.shipmentId} className='shipments-table-rows'>
                        <TableCell width={100} align='center'>
                          {order.shipmentId}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ ...flex.rrowBetween }}>
                            <Box>
                              <Tooltip title='حذف مرسوله' placement='top' arrow disableInteractive slots={{ transition: Zoom }} followCursor>
                                <IconButton color='error' onClick={handleDeleteToggle}>
                                  <DeleteRoundedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='ویرایش مرسوله' placement='top' arrow disableInteractive slots={{ transition: Zoom }} followCursor>
                                <IconButton color='info'>
                                  <EditRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            {order.product}
                          </Box>
                        </TableCell>
                        <TableCell width={70}>
                          {order.quantity}
                        </TableCell>
                        <TableCell>
                          {order.shipMethod}
                        </TableCell>
                        <TableCell>
                          {order.shipTime}
                        </TableCell>
                        <TableCell>
                          {order.shipTime}
                        </TableCell>
                        <TableCell>
                          {order.info}
                        </TableCell>
                        <TableCell align='center' width={100}>
                          <Menu
                            id="basic-menu"
                            anchorEl={shipmentAnchorEl}
                            open={shipmentPrintMenuOpen}
                            onClose={handleShippmentPrintToggle}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'center',
                            }}
                            transformOrigin={{
                              vertical: 'top',
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
                              <MenuItem onClick={handleShippmentPrintToggle} sx={{ ...flex.rrowBetween }}>
                                <LocalPrintshopRoundedIcon color='info' sx={{ ml: 1 }} />
                                <Typography variant="subtitle2">چاپ حواله انبار</Typography>
                              </MenuItem>
                            </MenuList>
                          </Menu>
                          <Tooltip title='چاپ حواله' placement='top' arrow disableInteractive slots={{ transition: Zoom }} followCursor>
                            <IconButton color="info" onClick={handleShipmentPrintClick}>
                              <LocalPrintshopRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Box className='contact-table-container' sx={{ m: 2 }}>
                <Table className='contact-table'>
                  {accs.map((acc) => (
                    <TableRow key={acc.id} className='contact-table-row'>
                      <TableCell sx={{ ...width.half }}>
                        <Typography sx={{ ...flex.row }}>
                          <FmdGoodRoundedIcon />
                          آدرس پروژه:
                          {'      ' + acc.address}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...width.half }}>
                        <Box sx={{ ...flex.row, ...flex.alignCenter, gap: '10px' }}>
                          <Combo
                            label='شماره تماس'
                            value={number}
                            options={acc.callNumbers.map(num => ({ title: num }))}
                            onChange={setNumber}
                            menu={true}
                            menuItems={[
                              {
                                label: 'افزودن شماره',
                                endIcon: <AddIcon />,
                                function: () => console.log('Add Project clicked'),
                              },
                            ]}
                            sx={{ ...width.full }}
                          />
                          <Box sx={{ ...flex.row, gap: '5px' }}>
                            <Tooltip title="ارسال جزئیات سفارش" placement='top' arrow disableInteractive slots={{ transition: Zoom }} followCursor>
                              <IconButton color="secondary" onClick={() => console.log('Send Order Details clicked')}>
                                <SendRoundedIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="تماس با شماره" placement='top' arrow disableInteractive slots={{ transition: Zoom }} followCursor>
                              <IconButton color="success" onClick={() => console.log('Send Order Details clicked')}>
                                <CallRoundedIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </Zoom>
    </React.Fragment >
  );
}

export default function Orders() {
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(null);
  const [toDate, setToDate] = React.useState<Dayjs | null>(null);
  const [orderId, setOrderId] = React.useState('');
  const [deleteModal, setDeleteModal] = React.useState(false);
  const wears = ['لواسان', 'تهران پارس', 'شریف آباد'];
  const shipmethods = ['نیسان', 'خاور', 'خاور ترانزیت'];
  const { mode } = useThemeMode()

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handelDeleteToggle = () => {
    setDeleteModal(!deleteModal)
  }

  const testlog = () => {
    console.log(tableRowClasses.root);
    console.log('tableRowClasses');
  };

  const drawerContent = (
    <>
      <Box sx={{ ...flex.columnBetween, ...flex.alignStart, position: 'relative', ...height.full, bgcolor: 'background.paper' }}>
        <Typography variant='h6' sx={{ mb: 2, pl: 2, pt: 2 }}>جست و جوی پیشرفته</Typography>
        <Box
          sx={{
            ...flex.column,
            width: 'calc(100% - 10px)',
            height: '100%',
            minHeight: 0,
            flex: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none',
          }}
        >
          <Box sx={{ px: 2 }}>
            <Slide
              direction="up"
              in={drawerOpen === true}
              mountOnEnter
              unmountOnExit
              timeout={300}
              style={{
                transitionDelay: '150ms',
              }}
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography component="span">
                    بر اساس کد سفارش
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <NumberField
                      id="orderId"
                      label="کد سفارش"
                      value={orderId}
                      onChange={setOrderId}
                      decimal={false}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Slide>
            <Slide
              direction="up"
              in={drawerOpen === true}
              mountOnEnter
              unmountOnExit
              timeout={300}
              style={{
                transitionDelay: '250ms',
              }}
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography component="span">
                    بر اساس انبار
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Autocomplete
                      disablePortal
                      options={wears}

                      renderInput={(params) => <TextField {...params} label="انبار" />}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Slide>
            <Slide
              direction="up"
              in={drawerOpen === true}
              mountOnEnter
              unmountOnExit
              timeout={300}
              style={{
                transitionDelay: '350ms',
              }}
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography component="span">
                    بر اساس شیوه تحویل
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Autocomplete
                      disablePortal
                      options={shipmethods}

                      renderInput={(params) => <TextField {...params} label="شیوه تحویل" />}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Slide>
            <Slide
              direction="up"
              in={drawerOpen === true}
              mountOnEnter
              unmountOnExit
              timeout={300}
              style={{
                transitionDelay: '450ms',
              }}
            >
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography component="span">بر اساس تاریخ</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <DatePicker
                      label="از تاریخ"
                      value={fromDate}
                      onChange={(newValue) => setFromDate(newValue)}
                    />
                    <DatePicker
                      label="تا تاریخ"
                      value={toDate}
                      onChange={(newValue) => setToDate(newValue)}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Slide>
          </Box>
        </Box>
      </Box>
      <Box sx={{ ...flex.row, ...width.full, gap: '10px', position: 'sticky', bottom: 0, p: 2, bgcolor: 'background.paper' }}>
        <Btn endIcon={<DeleteRoundedIcon />} color='error' variant='contained' fullWidth>
          حذف فیلترها
        </Btn>
        <Btn endIcon={<FilterListRoundedIcon />} color='success' variant='contained' onClick={testlog} fullWidth>
          اعمال فیلترها
        </Btn>
      </Box>
      <IconButton
        color='error'
        onClick={handleDrawerToggle}
        sx={{
          position: 'absolute',
          right: 0,
          width: '25px',
          height: '100%',
          borderRadius: 0,
          '& .MuiSvgIcon-root ': {
            fontSize: '30px'
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </>
  )

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          gap: drawerOpen ? '14px' : '0',
          overflow: 'hidden',
          height: '100%'
        }}
      >

        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: drawerOpen ? '360px' : 0,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            '& .MuiDrawer-paper': {
              bgcolor: 'background.paper',
              width: '360px',
              boxSizing: 'border-box',
              position: 'relative',
              borderRadius: '16px',
              border: 'none',
              scrollbarWidth: 'none',
              backgroundColor: 'background.default'
            },
          }}
        >
          {drawerContent}
        </Drawer>


        <Paper
          sx={{
            alignItems: 'center', justifyContent: 'center', mr: 1, borderRadius: '0 20px 20px 0', boxShadow: 'none',
            display: drawerOpen ? 'none' : 'flex',
            backgroundColor: 'background.default'
          }}
        >
          <Tooltip title='جست و جوی پیشرفته' placement='left' arrow disableInteractive slots={{ transition: Zoom }}>
            <IconButton
              color='info'
              onClick={handleDrawerToggle}
              sx={{
                width: '20px',
                height: '100%',
                '& .MuiSvgIcon-root ': {
                  fontSize: '30px'
                },
                borderRadius: '0 20px 20px 0',
                bgcolor: 'background.paper',
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        <PageContainer sx={{ p: 2 }} justif='start'>
          <Box sx={{ ...height.full }}>
            <TableContainer
              sx={{
                height: '100%',
                overflow: 'auto',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                borderWidth: '2px 2px 1px 2px',
                borderStyle: 'solid',
                borderColor: mode === 'light' ? '#D1D1D1' : '#616161',
                borderRadius: '16px',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      '& .MuiTableCell-root': {
                        backgroundColor: 'var(--table-header) !important'
                      }
                    }}
                  >
                    <TableCell align='center' width={50}>ردیف</TableCell>
                    <TableCell>کد سفارش</TableCell>
                    <TableCell>زمان سفارش</TableCell>
                    <TableCell>حساب مشتری</TableCell>
                    <TableCell>نوع سفارش</TableCell>
                    <TableCell>مبدأ ارسال</TableCell>
                    <TableCell>جزئیات پرداخت</TableCell>
                    <TableCell align='center'>وضعیت سفارش</TableCell>
                    <TableCell>توضیحات</TableCell>
                    <TableCell>ثبت کننده</TableCell>
                    <TableCell align="center">عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className='table-body-rows'>
                  {rows.map((row, index) => (
                    <Row
                      key={row.orderIdCode}
                      row={row}
                      index={index}
                      deleteModal={deleteModal}
                      setDeleteModal={setDeleteModal}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </PageContainer>
        <DeleteModal
          open={deleteModal}
          onClose={handelDeleteToggle}
          title='حذف مرسوله'
          buttonText='حذف شود'
          info='مرسوله مورد نظر حذف شود؟'
        />
      </Box>
    </>
  )
}