import React, { useCallback, useMemo, useEffect, useState, memo, use } from 'react'
import {
  Box,
  ToggleButton, Typography,
  Checkbox,
  IconButton,
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
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

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

import { useAccountStore, useProjectStore, useBranchDeliveryStore, useControlCart, useDistanceStore } from '@/stores';
import { useSnackbar } from "@/contexts/SnackBarContext";
import { getConnectedProject, getWarehouses } from '@/api';
import { Warehouse, ItemResaultPrice } from '@/models'

interface CartProps {
  setOpenCart: (value: boolean) => void;
  openCart: boolean;
}

const deliverySources = [
  {
    id: 1,
    method: 'از انبار'
  },
  {
    id: 2,
    method: 'مستقیم از کارخانه',
  }
];

const deliverySourceLabels = deliverySources.map(a => a.method);

const createDefaultRow = () => ({
  id: 9999,
  shipmentId: null,
  productServiceName: 'اطلاعات اضافی',
  quantity: 0,
  unit: '',
  pricePerUnite: 0,
  price: 0,
  offPrice: null,
  isDefaultRow: true
});

interface CartItemRow {
  id: number;
  shipmentId: number | null;
  productServiceName: string;
  quantity: number;
  unit: string;
  price: number;
  offPrice: number | null;
  originalItem?: ItemResaultPrice;
  isDefaultRow?: boolean;
}

export function Cart({ setOpenCart, openCart }: CartProps,) {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [projects, setProjects] = React.useState<string[]>([]);
  const [selectedProject, setSelectedProjectState] = React.useState<{ title: string; id: number } | null>(null);
  const [projectTitles, setProjectTitles] = React.useState<{ title: string; id: number }[]>([]);
  const [deliveryMethod, setDeliveryMethod] = React.useState<string[]>([]);
  const [deliveryTime, setDeliveryTime] = React.useState<string[]>([]);
  const [deliverySource, setDeliverySource] = React.useState<string | null>(null);
  const { toPersianPrice } = usePersianNumbers();
  const [moveItemModal, setMoveItemModal] = React.useState(false)
  const [deleteItemModal, setDeleteItemModal] = React.useState(false)
  const [confirmOrderModal, setConfirmOrderModal] = React.useState(false)
  const [paymentModal, setPaymentModal] = React.useState(false)
  const [warehouseLoading, setWarehouseLoading] = React.useState(false)
  const [deliveryMethodBot, setDeliveryMethodBot] = React.useState<string | null>('left');
  const [rawItems, setRawItems] = useState<ItemResaultPrice[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [Warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const [quantityMap, setQuantityMap] = useState<Record<number, number>>({});
  const [isFetchingDistance, setIsFetchingDistance] = useState(false);

  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);
  const setIsBranchDelivery = useBranchDeliveryStore((s) => s.setIsBranchDelivery);
  const [isTransit, setIsTransit] = useState(false);

  const { setSelectedProject, connectedProjects, setConnectedProjects } = useProjectStore();
  const { selectedAccount } = useAccountStore();
  const { showSnackbar, closeSnackbarById } = useSnackbar();
  const { distance, fetchDistance } = useDistanceStore();
  const {
    cartClose,
    products: cartProducts,
    isFetchingItems,
    isSelectingProject,
    isSelectingTransit,
    isFindingWarehouse,
    setIsFetchingItems,
    setIsSelectingProject,
    setIsSelectingTransit,
    setIsFindingWarehouse,
    currentCartDetails,
    selectedCartWarehouse,
    setSelectedCartWarehouse,
    isCartOpen
  } = useControlCart()

  const primaryDistance = useMemo(() => distance.find((d) => d.warehouseId > 0)?.warehouseId || null, [distance]);

  useEffect(() => {
    if (Array.isArray(cartProducts)) {
      setRawItems(cartProducts);
      // console.log("🚀 ~ Cart ~ cartProducts:", cartProducts)
      // console.log("🚀 ~ Cart ~ rawItems:", rawItems)
      // console.log("🚀 ~ Cart ~ rows:", rows)
    }
    getWarehouses()
      .then((warehouses) => {
        setWarehouse(warehouses);
      });
    if (currentCartDetails?.transit) {
      setDeliverySource('ارسال مستقیم از کارخانه')
    } else {
      setDeliverySource('از انبار')
    }
  }, [cartProducts]);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingDistance(true);
      try {
        const loadingSnackbarId = showSnackbar('درحال پردازش نزدیکترین انبار', 'info', 0, <InfoRoundedIcon />);
        await fetchDistance();
        closeSnackbarById(loadingSnackbarId);
      } catch (error: any) {
        setSelectedCartWarehouse(null);
        let errorMessage = 'خطا در دریافت فاصله';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        console.error("API error fetching distance:", error);
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      } finally {
        setIsFetchingDistance(false);
        showSnackbar('انبار پردازش شد', 'success', 4000, <DoneAllRoundedIcon />);
      }
    };
    if (!isBranchDelivery && isCartOpen) {
      fetchData();
    }
  }, [isBranchDelivery, selectedProject]);

  useEffect(() => {
    if (!isCartOpen || isBranchDelivery || !primaryDistance || Warehouse.length === 0) {
      return;
    }
    const matchedWarehouse = Warehouse.find(wh => wh.id === primaryDistance);
    if (isCartOpen && !isBranchDelivery) {
      setSelectedCartWarehouse(matchedWarehouse || null);
    }
  }, [primaryDistance, Warehouse, isBranchDelivery]);

  const rows = React.useMemo((): CartItemRow[] => {
    if (!isBranchDelivery && selectedCartWarehouse) {
      const filtered = rawItems.filter(
        item => item.warehouseId === selectedCartWarehouse.id
      );

      const mappedRows = filtered.map((item): CartItemRow => ({
        id: item.ididentity,
        shipmentId: item.cartId ?? 1,
        productServiceName: `${item.title} ${item.attributeGroupTitle}`.trim(),
        quantity: item.value ?? 1,
        unit: item.valueTitleBase || item.valueTitle || 'عدد',
        price: item.priceWarehouse,
        offPrice: item.discountPriceWarehouse > 0 ? item.discountPriceWarehouse : null,
        originalItem: item,
      }));

      return [...mappedRows, createDefaultRow()];
    }

    if (!selectedCartWarehouse) {
      return [createDefaultRow()];
    }

    const filtered = rawItems.filter(
      item => item.warehouseId === selectedCartWarehouse.id
    );

    const mappedRows = filtered.map((item): CartItemRow => ({
      id: item.ididentity,
      shipmentId: item.cartId ?? 1,
      productServiceName: `${item.title} ${item.attributeGroupTitle}`.trim(),
      quantity: item.value ?? 1,
      unit: item.valueTitleBase || item.valueTitle || 'عدد',
      price: item.priceWarehouse,
      offPrice: item.discountPriceWarehouse > 0 ? item.discountPriceWarehouse : null,
      originalItem: item,
    }));

    // Always append default/footer row
    return [...mappedRows, createDefaultRow()];
  }, [rawItems, selectedCartWarehouse, isBranchDelivery, quantityMap]);

  const totalInvoice = useMemo(() => {
    if (isBranchDelivery || !selectedCartWarehouse) return 0;

    return rows
      .filter(row => !row.isDefaultRow)
      .reduce((sum, row) => {
        const effectivePrice = row.offPrice ?? row.price;
        return sum + effectivePrice * row.quantity;
      }, 0);
  }, [rows, isBranchDelivery, selectedCartWarehouse]);

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

  const handleQuantityChange = useCallback((rowId: number, newQuantityStr: string) => {
    const newQty = parseFloat(newQuantityStr) || 0;
    setQuantityMap(prev => ({
      ...prev,
      [rowId]: newQty
    }));
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
    setIsBranchDelivery(!event.target.checked);
    if (!isBranchDelivery) {
      setWarehouseLoading(true);
    }
  };

  const changeBranchDelivery2 = (event: any) => {
    setIsBranchDelivery(event.target.checked);
    if (!isBranchDelivery) {
      setWarehouseLoading(true);
    }
  };

  const handledeliveryMethodBot = (
    event: React.MouseEvent<HTMLElement>,
    newdeliveryMethodBot: string | null,
  ) => {
    setDeliveryMethodBot(newdeliveryMethodBot);
  };

  const handleWarehouseChange = React.useCallback(
    (newValue: any) => {
      setSelectedCartWarehouse(newValue);
      console.log("🚀 ~ Cart ~ newValue:", newValue)
    },
    [setSelectedCartWarehouse]
  );

  const handleCloseCart = () => {
    cartClose();
    console.log("Cart closed", openCart);
  };

  useEffect(() => {
    if (selectedAccount && connectedProjects.length > 0) {
      const combinedProjects = connectedProjects.map((project) => ({
        title: `${selectedAccount.title} - ${project.title}`,
        id: project.id,
      }));

      setProjectTitles(combinedProjects);
    }
    if (!isBranchDelivery) {
      setWarehouseLoading(true);
      getWarehouses()
        .then((warehouses) => {
          setWarehouse(warehouses);
        });
    }
  }, [selectedAccount, connectedProjects]);

  // Sync selectedProject from global store to local state on mount or update
  useEffect(() => {
    const { selectedProject: globalSelectedProject } = useProjectStore.getState();

    if (globalSelectedProject && projectTitles.length > 0) {
      const matchedProject = projectTitles.find(pt => pt.id === globalSelectedProject.id);
      if (matchedProject && !selectedProject) {
        setSelectedProjectState(matchedProject);
        // Optionally also call setSelectedProject if needed for side effects in the store
        // But avoid infinite loops — only if necessary
      }
    }
    // If there's no global selection, you might want to reset or keep current
  }, [projectTitles, selectedProject]);

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
                value={deliveryTime}
                onChange={setDeliveryTime}
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
            <Box sx={{ minWidth: '120px', maxWidth: '180px', display: 'flex', justifyContent: 'start', mr: 1 }}>
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
          scrollbarWidth: 'none',
          pb: 3, pl: 2, pt: 0.6
        }}
      >
        <Box sx={{ ...flex.columnStart, }} >
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel checked={!isBranchDelivery} onChange={changeBranchDelivery1} control={<Switch size='small' defaultChecked color='info' />} label="ارسال به پروژه" sx={{ whiteSpace: 'nowrap' }} />
          </Box>
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel checked={isBranchDelivery} onChange={changeBranchDelivery2} control={<Switch size='small' color='info' />} label="تحویل درب انبار" sx={{ whiteSpace: 'nowrap' }} />
          </Box>
        </Box>
        <Grow in={!isBranchDelivery} timeout={450}>
          <Box
            sx={{
              width: '100%',
              ...flex.row,
              gap: '10px',
              display: !isBranchDelivery ? 'flex' : 'none',
            }}
          >
            <Combo
              value={selectedProject}
              onChange={(newValue) => {
                setSelectedProjectState(newValue);
                setSelectedProject(newValue);
              }}
              options={projectTitles.map(project => ({ title: project.title, id: project.id }))}
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
              label="حساب - پروژه"
              getOptionValue={(option) => (typeof option === 'string' ? option : option.id)}
              loading={isSelectingProject}
            />
            <Combo
              value={deliverySource}
              onChange={setDeliverySource}
              options={deliverySourceLabels.map(label => ({ title: label }))}
              label='ارسال به صورت'
              // @ts-ignore
              getOptionValue={(option) => option.title}
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
            />
            <Grow in={deliveryMethodBot === "auto"} timeout={450}>
              <Combo
                value={projects}
                onChange={setProjects}
                options={projectTitles.map(pt => ({ title: pt.title }))}
                sx={{ width: '100%', maxWidth: '270px', minWidth: '200px', display: deliveryMethodBot === 'auto' ? 'flex' : 'none', }}
                label='شیوه تحویل'
              />
            </Grow>
            <ToggleButtonGroup
              className='sale-button-group'
              value={deliveryMethodBot}
              exclusive
              onChange={handledeliveryMethodBot}
              sx={{ display: isBranchDelivery ? 'none' : 'flex', '& button': { borderRadius: '50px', minWidth: '80px', height: '56px' }, }}
            >
              <ToggleButton color='primary' value="auto" disabled><AutoAwesomeRoundedIcon sx={{ mr: 0.5 }} />خودکار</ToggleButton>
              <ToggleButton color='primary' value="manual">دستی <TouchAppRoundedIcon sx={{ ml: 0.5 }} /></ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grow>
        <Grow in={isBranchDelivery} timeout={450}>
          <Box
            sx={{
              ...flex.justifyBetween,
              width: '100%',
              justifyContent: 'start',
              display: isBranchDelivery ? 'flex' : 'none',
            }}
          >
            <Combo
              options={Warehouse}
              value={selectedCartWarehouse}
              onChange={handleWarehouseChange}
              loading={isFindingWarehouse}
              loadingText="در حال بارگذاری..."
              noOptionsText="هیچ گزینه‌ای موجود نیست"
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
            <Typography variant='subtitle1'>مبلغ کل فاکتور: {toPersianPrice(totalInvoice)}</Typography>
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
        {rows.length === 1 && rows[0].isDefaultRow ? (
          <Box sx={{ p: 2, textAlign: 'center', width: '100%', height: '100%', ...flex.center, border: '2px solid var(--table-border-overlay)', borderRadius: '25px' }}>
            <Typography>هیچ آیتمی در این انبار موجود نیست.</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isFetchingItems}
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
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          gap: '14px',
          flex: 0.18,
          mt: 1.5
        }}
      >
        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCartRoundedIcon sx={{ fontSize: '22px' }} />
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', mr: 4 }}>
            مسئول فروش:
            <Typography variant="body1"> {currentCartDetails ? toPersianDigits(' ' + currentCartDetails.orderMan) : ' '} </Typography>
          </Typography>
          {currentCartDetails && currentCartDetails.broker !== 'none' && (
            <>
              <GroupRoundedIcon sx={{ fontSize: '22px' }} />
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                واسطه گر:
                <Typography variant="body1">
                  {toPersianDigits(' ' + currentCartDetails.broker)}
                </Typography>
              </Typography>
            </>
          )}

        </Box> */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
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