import React, { memo } from 'react'
import {
  alpha,
  Box,
  Button,
  Paper,
  ToggleButton, Typography,
  TextField, Select, SelectChangeEvent, MenuItem, InputLabel, OutlinedInput,
  Checkbox,
  IconButton,
  FormControl,
  ToggleButtonGroup,
  Switch, FormControlLabel,
  Grow
} from '@mui/material'
import { DataGrid, GridColDef, gridClasses, GridRowsProp } from '@mui/x-data-grid';

import Btn from '@/components/elements/Btn';

import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import PersonIcon from '@mui/icons-material/Person';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';

// import TButtonGroup from '@/components/elements/TButtonGroup'
import { toPersianDigits } from '@/utils/persianNumbers';
import { useThemeMode } from '@/contexts/ThemeContext';
import usePersianNumbers from '@/hooks/usePersianNumbers';
import NumberField from '@/components/elements/NumberField';
import Combo from '@/components/elements/Combo';
import { persianDataGridLocale, hiddenFooterStyles } from '@/components/datagrids/DataGridProps';
import { RialIcon } from '@/components/elements/TomanIcon';
import MoveItemModal from '@/pages/Dashboard/Sales/Modals/MoveItemModal';
import DeleteModal from '@/pages/Dashboard/Sales/Modals/DeleteModal';
import BaseModal from '@/pages/Dashboard/Sales/Modals/BaseModal';
import PaymentModal from '@/pages/Dashboard/Sales/Modals/PaymentModal';
import { flex, size } from '@/models/ReadyStyles';

import { cart1Details, accounts, shipments } from '@/samples/sabadkharid';

import { useAccountStore, useProjectStore, useBranchDeliveryStore } from '@/stores';
import { getConnectedProject, getSaleAccounts } from '@/api';

interface CartProps {
  setOpenCart: (value: boolean) => void;
  openCart: boolean;
}

const accountProjectLabels = accounts.map(a => `${a.account} - ${a.project}`);

const generateRows = () => {
  const rows: any[] = [];
  let rowId = 1;

  shipments.forEach((shipment) => {
    shipment.items.forEach((item) => {
      rows.push({
        id: rowId++,
        shipmentId: shipment.accId,
        productServiceName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnite: item.pricePerUnite,
        price: item.price,
        offPrice: item.offPrice,
        originalItem: item // Keep reference to original item for updates
      });
    });
  });

  return rows;
};

const createDefaultRow = () => ({
  id: 'default-info-row',
  shipmentId: null,
  productServiceName: 'اطلاعات اضافی',
  quantity: 0,
  unit: '',
  pricePerUnite: 0,
  price: 0,
  offPrice: null,
  isDefaultRow: true
});

const generateRowsWithDefault = () => {
  const dynamicRows = generateRows();
  const defaultRow = createDefaultRow();
  return [...dynamicRows, defaultRow];
};

export function Cart({ setOpenCart, openCart }: CartProps,) {
  const [rows, setRows] = React.useState(generateRowsWithDefault());
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [projects, setProjects] = React.useState<string[]>([]);
  const [deliveryMethod, setDeliveryMethod] = React.useState<string[]>([]);
  const { toPersianPrice } = usePersianNumbers();
  const [moveItemModal, setMoveItemModal] = React.useState(false)
  const [deleteItemModal, setDeleteItemModal] = React.useState(false)
  const [confirmOrderModal, setConfirmOrderModal] = React.useState(false)
  const [paymentModal, setPaymentModal] = React.useState(false)
  const [deliveryMethodBot, setDeliveryMethodBot] = React.useState<string | null>('left');

  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);
  const setIsBranchDelivery = useBranchDeliveryStore((s) => s.setIsBranchDelivery);

  const handleMoveItemModalToggle = () => {
    setMoveItemModal(prev => !prev)
  }

  const handleDeleteItemModalToggle = () => {
    setDeleteItemModal(prev => !prev)
  }

  const handleConfirmModalToggle = () => {
    setConfirmOrderModal(prev => !prev)
  }

  const handlePaymentModalToggle = () => {
    setPaymentModal(prev => !prev)
  }

  const confirmOrder = () => {
    console.log('Order confirmed');
    setPaymentModal(true)
    handleConfirmModalToggle()
  }

  const handleQuantityChange = React.useCallback((rowId: number, newQuantity: string) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === rowId
          ? { ...row, quantity: parseFloat(newQuantity) || 0 }
          : row
      )
    );
  }, []);

  const handleRowSelect = React.useCallback((rowId: number, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  }, []);

  const changeBranchDelivery1 = (event: any) => {
    setIsBranchDelivery(event.target.checked);
  };

  const changeBranchDelivery2 = (event: any) => {
    setIsBranchDelivery(!event.target.checked);
  };

  const handledeliveryMethodBot = (
    event: React.MouseEvent<HTMLElement>,
    newdeliveryMethodBot: string | null,
  ) => {
    setDeliveryMethodBot(newdeliveryMethodBot);
  };

  const handleCloseCart = () => {
    if (openCart === true) {
      setOpenCart(!openCart);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'shipment',
      headerName: 'مرسوله',
      width: 220,
      disableColumnMenu: true,
      align: 'center' as const,
      headerAlign: 'center' as const,
      resizable: true,
      valueGetter: (value, row) => row.shipmentId,
      rowSpanValueGetter: (value, row) => row.shipmentId,
      cellClassName: 'shipment-merged-cell',
      renderCell: (params) => {
        const shipmentId = params.row.shipmentId;
        if (params.row.isDefaultRow) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
              <Combo
                value={deliveryMethod}
                onChange={setDeliveryMethod}
                options={[]}
                label='شیوه های تحویل'
                sx={{ width: '100%' }}
              />
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', height: '100%', width: '100%', gap: 0.5, p: '0 0 0 20px ' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', px: '2px' }}>
              {shipmentId}
            </Typography>
            <IconButton
              color='info'
              sx={{ px: '2px' }}
              onClick={handleMoveItemModalToggle}
            >
              <SwapVertRoundedIcon />
            </IconButton>
            <IconButton
              color='error'
              sx={{ px: '2px' }}
              onClick={handleDeleteItemModalToggle}
            >
              <DeleteRoundedIcon />
            </IconButton>
          </Box>
        );
      }
    },
    {
      field: 'productServiceName',
      headerName: 'کالا / خدمات',
      disableColumnMenu: true,
      width: 420,
      resizable: true,
      flex: 0.45,
      renderCell: (params) => {
        const rowId = params.row.id;
        const isChecked = selectedRows.has(rowId);
        if (params.row.isDefaultRow) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
              <Combo
                value={deliveryMethod}
                onChange={setDeliveryMethod}
                options={[]}
                label='انتخاب زمان تحویل'
                sx={{ width: '100%' }}
              />
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
            <Checkbox
              checked={isChecked}
              onChange={(e) => handleRowSelect(rowId, e.target.checked)}
              size="small"
            />
            <Typography variant="body2">
              {params.row.productServiceName}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'quantity',
      headerName: 'تعداد',
      disableColumnMenu: true,
      width: 240,
      resizable: true,
      flex: 0.22,
      renderCell: (params) => {
        if (params.row.isDefaultRow) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
              <NumberField
                // @ts-ignore
                value='سرویس'
                onChange={() => { }}
              />
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%', justifyContent: 'start' }}>
            <Box sx={{ minWidth: '180px', maxWidth: '180px', display: 'flex', justifyContent: 'start', mr: 1 }}>
              <NumberField
                value={params.row.quantity.toString()}
                // @ts-ignore
                onChange={(value) => handleQuantityChange(params.row.id, value)}
                min={0}
                step={1.0}
              />
            </Box>
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              {params.row.unit}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'pricePerUnite',
      headerName: 'فی',
      disableColumnMenu: true,
      width: 200,
      resizable: true,
      flex: 0.2,
      rowSpanValueGetter: () => null,
      renderCell: (params) => {
        const hasOffPrice = params.row.offPrice;
        if (params.row.isDefaultRow) {
          return null;
        }
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
            {hasOffPrice ? (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  {toPersianPrice(params.row.price)}
                </Typography>
                <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  {toPersianPrice(params.row.offPrice)}
                </Typography>
              </>
            ) : (
              <Typography variant="body1">
                {toPersianPrice(params.row.price)}
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      field: 'totalPrice',
      headerName: 'مبلغ کل',
      disableColumnMenu: true,
      width: 200,
      resizable: true,
      flex: 0.2,
      renderCell: (params) => {
        const effectivePrice = params.row.offPrice || params.row.price;
        const total = effectivePrice * params.row.quantity;
        if (params.row.isDefaultRow) {
          return null; // Don't show anything for default row
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography align='center' variant="body1">
              {toPersianPrice(total)}
            </Typography>
          </Box>
        );
      }
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...size.full
      }}
    >
      <Box
        className='cart-header-container'
        sx={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '50px',
          overflowX: 'auto',
          // overflowY: 'hidden',
          scrollbarWidth: 'none',
          pb: 3, pl: 2, pt: 0.6
        }}
      >
        <Box sx={{ ...flex.columnStart, }} >
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel checked={isBranchDelivery} onChange={changeBranchDelivery1} control={<Switch size='small' defaultChecked color='info' />} label="ارسال به پروژه" sx={{ whiteSpace: 'nowrap' }} />
          </Box>
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel checked={!isBranchDelivery} onChange={changeBranchDelivery2} control={<Switch size='small' color='info' />} label="تحویل درب انبار" sx={{ whiteSpace: 'nowrap' }} />
          </Box>
        </Box>
        <Grow in={isBranchDelivery} timeout={450}>
          <Box
            sx={{
              width: '100%',
              ...flex.row,
              gap: '10px',
              display: isBranchDelivery ? 'flex' : 'none',
            }}
          >
            <Combo
              value={projects}
              onChange={setProjects}
              options={accountProjectLabels.map(label => ({ title: label }))}
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
              label='حساب - پروژه'
            />
            <Combo
              value={projects}
              onChange={setProjects}
              options={accountProjectLabels.map(label => ({ title: label }))}
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
              label='ارسال به صورت'
            />
            <Grow in={deliveryMethodBot === "auto"} timeout={450}>
              <Combo
                value={projects}
                onChange={setProjects}
                options={accountProjectLabels.map(label => ({ title: label }))}
                sx={{ width: '100%', maxWidth: '270px', minWidth: '200px', display: deliveryMethodBot === 'auto' ? 'flex' : 'none', }}
                label='شیوه تحویل'
              />
            </Grow>
            <ToggleButtonGroup
              className='sale-button-group'
              value={deliveryMethodBot}
              exclusive
              onChange={handledeliveryMethodBot}
              sx={{ display: isBranchDelivery ? 'flex' : 'none', '& button': { borderRadius: '50px', minWidth: '80px' }, }}
            >
              <ToggleButton color='primary' value="auto" disabled><AutoAwesomeRoundedIcon sx={{ mr: 0.5 }} />خودکار</ToggleButton>
              <ToggleButton color='primary' value="manual">دستی <TouchAppRoundedIcon sx={{ ml: 0.5 }} /></ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grow>
        <Grow in={!isBranchDelivery} timeout={450}>
          <Box
            sx={{
              ...flex.justifyBetween,
              width: '100%',
              justifyContent: 'start',
              display: isBranchDelivery ? 'none' : 'flex',
            }}
          >
            <Combo
              value={projects}
              onChange={setProjects}
              options={accountProjectLabels.map(label => ({ title: label }))}
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
              label='نام انبار'
            />
          </Box>
        </Grow>
        <Box
          className='cart-header-buttons'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            gap: '14px',
            flex: 0.18,
          }}
        >
          <Box
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '250px',
              whiteSpace: 'nowrap',
              gap: '10px',
              boxShadow: '0 20px 16px -12px #00ff684d',
              borderRadius: '10px'
            }}
          >
            <Typography variant='subtitle1'>مبلغ کل فاکتور: {toPersianPrice('120000')}</Typography>
            <RialIcon size={28} />
          </Box>
        </Box>
      </Box>
      <Box
        className='cart-details-container'
        sx={{
          height: '100%',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={52}
          rowSpanning={true}
          showCellVerticalBorder
          columnHeaderHeight={64}
          rowSelection={false}
          density="compact"
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          getRowClassName={(params) => {
            if (params.row.isDefaultRow) {
              return 'default-row';
            }
            return params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
          }}
          pageSizeOptions={[10, 25, 50, 100, { value: -1, label: 'همه' }]}
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'background.paper'
            },
            ...hiddenFooterStyles(),
          }}
          localeText={persianDataGridLocale}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flex: 0.18,
          mt: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCartRoundedIcon sx={{ fontSize: '22px' }} />
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', mr: 4 }}>
            مسئول فروش:
            <Typography variant="body1"> {toPersianDigits(' ' + cart1Details.orderMan)} </Typography>
          </Typography>
          {cart1Details.broker !== 'none' && (
            <>
              <GroupRoundedIcon sx={{ fontSize: '22px' }} />
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                واسطه گر:
                <Typography variant="body1"> {toPersianDigits(' ' + cart1Details.broker)} </Typography>
              </Typography>
            </>
          )}

        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            gap: '12px',
            flex: 0.18,
          }}
        >
          <Btn color='error' onClick={handleCloseCart} variant='contained' sx={{ height: '54px', minWidth: '56px', py: 1 }}>
            خروج
            <CloseRoundedIcon sx={{ ml: 1 }} />
          </Btn>
          <Btn color='success' onClick={handleConfirmModalToggle} variant='contained' sx={{ height: '84px', minWidth: '56px', whiteSpace: 'nowrap', py: 1 }}>
            ثبت سفارش
            <DoneAllIcon sx={{ ml: 1 }} />
          </Btn>
        </Box>
      </Box>
      <MoveItemModal
        open={moveItemModal}
        onClose={handleMoveItemModalToggle}
      />
      <DeleteModal
        open={deleteItemModal}
        onClose={handleDeleteItemModalToggle}
        title='حذف آیتم'
        buttonText='حذف شود'
        info='آیتم مورد نظر حذف شود؟'
      />
      <BaseModal
        open={confirmOrderModal}
        onClose={handleConfirmModalToggle}
        title='تأیید سفارش'
        buttonText='تأیید'
        info='سفارش مورد نظر ثبت شود؟'
        width='400px'
        windowColor='success'
        buttonColor='success'
        buttonFunc={confirmOrder}
      />
      <PaymentModal
        open={paymentModal}
        onClose={handlePaymentModalToggle}
      />
    </Box>
  )
}