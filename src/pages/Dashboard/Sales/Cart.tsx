import React, { useCallback, useMemo, useEffect, useState } from 'react'
import {
  Box,
  ToggleButton, Typography,
  Checkbox,
  IconButton,
  ToggleButtonGroup,
  Switch, FormControlLabel,
  Grow,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableContainer,
  TableHead
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import Btn from '@/components/elements/Btn';

import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

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
import { getWarehouses } from '@/api';
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
  const [isFetchingDistance, setIsFetchingDistance] = useState(false);
  const [services, setServices] = useState(0);

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
    isCartOpen,
    cartShipments
  } = useControlCart()

  const primaryDistance = useMemo(() => distance.find((d) => d.warehouseId > 0)?.warehouseId || null, [distance]);

  useEffect(() => {
    if (cartProducts.length === 0) {
      setRawItems([]);
      return;
    }

    // If items don't have tempShipmentId, assign them to first shipment
    const hasAnyAssigned = cartProducts.some(p => p.tempShipmentId !== undefined && p.tempShipmentId !== null);
    const firstShipmentId = cartShipments[0]?.id || null;

    const mapped = hasAnyAssigned
      ? cartProducts
      : cartProducts.map(item => ({
        ...item,
        tempShipmentId: firstShipmentId
      }));

    setRawItems(mapped);
  }, [cartProducts, cartShipments]);

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

    const matchedWarehouse = Warehouse.find(wh => wh.id === primaryDistance) || null;

    if (!matchedWarehouse) {
      setSelectedCartWarehouse(null);
      return;
    }

    setSelectedCartWarehouse(matchedWarehouse);

    // 🔁 Clean up shipments & reassign items
    const { cartShipments, removeShipment, addShipment } = useControlCart.getState();

    // Remove all existing shipments
    cartShipments.forEach(s => removeShipment(s.id));

    // Create one new shipment for this warehouse
    const newShipmentId = addShipment({
      warehouseId: matchedWarehouse.id,
      deliveryMethod: null,
      deliveryDate: null,
    });

    // Reassign all items to this shipment
    const updatedItems = rawItems.map(item => ({
      ...item,
      tempShipmentId: newShipmentId
    }));

    setRawItems(updatedItems);

    // Optionally update global cart details
    useControlCart.setState(state => ({
      currentCartDetails: state.currentCartDetails
        ? { ...state.currentCartDetails, warehouseId: matchedWarehouse.id }
        : null
    }));
  }, [isCartOpen, isBranchDelivery, primaryDistance, Warehouse, isFetchingDistance]);

  const rows = React.useMemo((): CartItemRow[] => {
    if (!selectedCartWarehouse) {
      return [];
    }

    const filtered = rawItems.filter(
      item => {
        console.log("🚀 ~ Cart ~ selectedCartWarehouse:", selectedCartWarehouse)
        return item.warehouseId === selectedCartWarehouse.id;
      }
    );

    const mappedRows = filtered.map((item): CartItemRow => ({
      id: item.ididentity + item.warehouseId,
      shipmentId: item.cartId ?? 1,
      productServiceName: `${item.title} ${item.attributeGroupTitle}`.trim(),
      quantity: item.value ?? 1,
      unit: item.valueTitleBase || item.valueTitle || 'عدد',
      price: item.priceWarehouse,
      offPrice: item.discountPriceWarehouse > 0 ? item.discountPriceWarehouse : null,
      originalItem: item,
    }));

    return [...mappedRows, createDefaultRow()];

  }, [rawItems, selectedCartWarehouse]);

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

  const handleBranchDeliveryChange = useCallback(
    (event: React.SyntheticEvent, checked: boolean) => {
      // Update Zustand store: both UI flag and cart detail
      setIsBranchDelivery(checked);

      useControlCart.setState((state) => ({
        currentCartDetails: state.currentCartDetails
          ? { ...state.currentCartDetails, branchCenterDelivery: checked }
          : null
      }));

      if (!isBranchDelivery) {
        setWarehouseLoading(true);
      }
    },
    [isBranchDelivery]
  );

  const handledeliveryMethodBot = (
    event: React.MouseEvent<HTMLElement>,
    newdeliveryMethodBot: string | null,
  ) => {
    setDeliveryMethodBot(newdeliveryMethodBot);
  };

  const handleWarehouseChange = useCallback(
    (newValue: Warehouse | null) => {
      setSelectedCartWarehouse(newValue);

      // Sync with currentCartDetails
      if (newValue) {
        useControlCart.setState(state => ({
          currentCartDetails: state.currentCartDetails
            ? { ...state.currentCartDetails, warehouseId: newValue.id }
            : null
        }));
      }
    },
    []
  );

  const handleDeliverySourceChange = useCallback(
    (newSource: string | null) => {
      if (!newSource) return;

      const isTransit = newSource === 'مستقیم از کارخانه';

      // Update local state
      setDeliverySource(newSource);

      // Update currentCartDetails.transit
      useControlCart.setState(state => ({
        currentCartDetails: state.currentCartDetails
          ? { ...state.currentCartDetails, transit: isTransit }
          : null
      }));

      // Optional: Auto-set warehouseId from primaryDistance if available
      if (!isTransit && primaryDistance) {
        const matchedWh = Warehouse.find(wh => wh.id === primaryDistance);
        if (matchedWh) {
          setSelectedCartWarehouse(matchedWh);
          useControlCart.setState(state => ({
            currentCartDetails: state.currentCartDetails
              ? { ...state.currentCartDetails, warehouseId: matchedWh.id }
              : null
          }));
        }
      }
    },
    [primaryDistance, Warehouse]
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

    // Only fetch warehouses if not in branch delivery AND not already loaded
    if (!isBranchDelivery && Warehouse.length === 0) {
      setWarehouseLoading(true);
      getWarehouses()
        .then((warehouses) => {
          setWarehouse(warehouses);
        })
        .finally(() => {
          setWarehouseLoading(false);
        });
    }
  }, [selectedAccount, connectedProjects, isBranchDelivery, Warehouse.length]); // ← add Warehouse.length to deps

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

  useEffect(() => {
    // If cart is open, has items, but no shipments → create one
    if (
      isCartOpen &&
      cartProducts.length > 0 &&
      cartShipments.length === 0
    ) {
      // Use selected warehouse or primary distance as fallback
      const defaultWhId = selectedCartWarehouse?.id || primaryDistance || null;

      useControlCart.getState().addShipment({
        warehouseId: defaultWhId,
        deliveryMethod: null,
        deliveryDate: null,
      });

      console.log('✅ Created default shipment for items');
    }
  }, [isCartOpen, cartProducts.length, cartShipments.length, selectedCartWarehouse, primaryDistance]);


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
            <FormControlLabel checked={!isBranchDelivery} onChange={handleBranchDeliveryChange} control={<Switch size='small' defaultChecked color='info' />} label="ارسال به پروژه" sx={{ whiteSpace: 'nowrap' }} />
          </Box>
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel checked={isBranchDelivery} onChange={handleBranchDeliveryChange} control={<Switch size='small' color='info' />} label="تحویل درب انبار" sx={{ whiteSpace: 'nowrap' }} />
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
              onChange={handleDeliverySourceChange}
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
        className="cart-details-container"
        sx={{
          display: 'flex',
          border: '2px solid var(--border-main)',
          borderRadius: '16px',
          height: '100%'
        }}
      >
        <TableContainer sx={{ borderRadius: '16px' }}>
          <Table stickyHeader>
            <TableHead
              sx={{
                '& .MuiTableCell-root': {
                  p: 1.5,
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  borderBottom: '2px solid var(--border-main)',
                  backgroundColor: "var(--table-header) !important",
                  '&:not(.first-cell)::before': {
                    content: '""',
                    position: 'absolute',
                    top: '6px',
                    left: 0,
                    right: 0,
                    bottom: '6px',
                    width: '2px',
                    backgroundColor: 'var(--border-main)',
                  },
                },
              }}
            >
              <TableRow>
                <TableCell className='first-cell' width={150}>مرسوله</TableCell>
                <TableCell width={400}>کالا / خدمات</TableCell>
                <TableCell width={120}>تعداد</TableCell>
                <TableCell width={120}>فی</TableCell>
                <TableCell width={120}>مبلغ کل</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetchingItems ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">در حال بارگذاری آیتم‌ها...</TableCell>
                </TableRow>
              ) : cartShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    هیچ مرسوله‌ای تعریف نشده است.
                  </TableCell>
                </TableRow>
              ) : (
                cartShipments.map((shipment, index) => {
                  const shipmentNumber = index + 1;
                  const itemsInShipment = rawItems.filter(
                    (item) => item.tempShipmentId === shipment.id && item.warehouseId === selectedCartWarehouse?.id
                  );

                  return [
                    ...itemsInShipment.map((item, itemIndex) => {
                      const rowId = item.ididentity + item.warehouseId;
                      const isChecked = selectedRows.has(rowId);
                      const hasDiscount = item.discountPriceWarehouse > 0;
                      const basePrice = item.priceWarehouse;
                      const finalPrice = hasDiscount ? item.discountPriceWarehouse : basePrice;
                      const quantity = item.value || 1;
                      const total = finalPrice * quantity;

                      return (
                        <TableRow
                          key={rowId}
                          sx={{
                            '& .MuiTableCell-root': {
                              position: 'relative',
                              whiteSpace: 'nowrap',
                              '&:not(.first-cell)::before': {
                                content: '""',
                                position: 'absolute',
                                top: '6px',
                                left: 0,
                                right: 0,
                                bottom: '6px',
                                width: '2px',
                                backgroundColor: 'var(--table-border-overlay)',
                              },
                            },
                          }}
                        >
                          {/* Only first item renders the shipment cell */}
                          {itemIndex === 0 && (
                            <TableCell className='first-cell' rowSpan={itemsInShipment.length} sx={{ verticalAlign: 'center' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100%', justifyContent: 'space-around' }}>
                                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                                  {shipmentNumber}
                                </Typography>
                                <Box>
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={handleMoveItemModalToggle}
                                    title="جابجایی مرسوله"
                                  >
                                    <SwapVertRoundedIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={handleDeleteItemModalToggle}
                                    title="حذف آیتم از مرسوله"
                                  >
                                    <DeleteRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </TableCell>
                          )}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                                size="small"
                              />
                              <Typography variant="body2">
                                {`${item.title} ${item.attributeGroupTitle}`.trim()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ ...flex.row, ...flex.alignCenter, gap: 2, width: 'fit-content' }}>
                              <NumberField
                                value={quantity}
                                onChange={(value) => { }}
                                min={0}
                                step={1.0}
                                sx={{ maxWidth: '160px', minWidth: '120px' }}
                              />
                              <Typography variant="body2">
                                {item.valueTitleBase || item.valueTitle || 'عدد'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              {hasDiscount && (
                                <Typography
                                  variant="caption"
                                  sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                >
                                  {toPersianPrice(basePrice)}
                                </Typography>
                              )}
                              <Typography
                                variant="body1"
                                color={hasDiscount ? 'error.main' : 'text.primary'}
                              >
                                {toPersianPrice(finalPrice)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1">
                              {toPersianPrice(total)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }),

                    // Shipment Options Row (one per shipment)
                    <TableRow
                      key={`options-${shipment.id}`}
                      sx={{
                        '& .MuiTableCell-root': {
                          position: 'relative',
                          whiteSpace: 'nowrap',
                          borderBottomWidth: '2px',
                          '&:not(.first-cell)::before': {
                            content: '""',
                            position: 'absolute',
                            top: '6px',
                            left: 0,
                            right: 0,
                            bottom: '6px',
                            width: '2px',
                            backgroundColor: 'var(--table-border-overlay)',
                          },
                        },
                      }}
                    >
                      <TableCell className='first-cell'>
                        <Combo
                          value={deliveryMethod}
                          onChange={setDeliveryMethod}
                          options={[]} // Populate later as needed
                          label="شیوه تحویل"
                        />
                      </TableCell>
                      <TableCell>
                        <Combo
                          value={deliveryTime}
                          onChange={setDeliveryTime}
                          options={[]} // Populate later
                          label="زمان تحویل"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ ...flex.row, ...flex.alignCenter, gap: 2, width: 'fit-content', flexWrap: 'wrap' }}>
                          <NumberField
                            value={services}
                            onChange={() => { }}
                            disabled
                            sx={{ maxWidth: '160px', minWidth: '120px' }}
                          />
                          <Typography variant="body1" color="initial">
                            سرویس
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <h4>cell 4</h4>
                      </TableCell>
                      <TableCell>
                        <h4>cell 5</h4>
                      </TableCell>
                    </TableRow>
                  ];
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
        items={rawItems}
        selectedRowIds={selectedRows}
        onUpdate={(updatedItems) => {
          // Update rawItems → triggers re-render of rows
          setRawItems(updatedItems);
          showSnackbar('آیتم‌ها منتقل شدند', 'success', 3000, <DoneAllRoundedIcon />);
        }}
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