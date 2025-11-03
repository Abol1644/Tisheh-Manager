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

export function Cart({ setOpenCart, openCart }: CartProps,) {
  const [projects, setProjects] = React.useState<string[]>([]);
  const [selectedProjectState, setSelectedProjectState] = React.useState<{ title: string; id: number } | null>(null);
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
  const [Warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const [isFetchingDistance, setIsFetchingDistance] = useState(false);
  const [services, setServices] = useState(0);

  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);
  const setIsBranchDelivery = useBranchDeliveryStore((s) => s.setIsBranchDelivery);

  const { selectedProject, setSelectedProject, connectedProjects } = useProjectStore();
  const { selectedAccount } = useAccountStore();
  const { showSnackbar, closeSnackbarById } = useSnackbar();
  const { distance, fetchDistance } = useDistanceStore();
  const {
    cartClose,
    products: cartProducts,
    isFetchingItems,
    isSelectingProject,
    isFindingWarehouse,
    selectedCartWarehouse,
    setSelectedCartWarehouse,
    isCartOpen,
    cartShipments,
    removeShipment,
    addShipment,
    selectedItemKeys,
    toggleSelectedItem,
    clearSelectedItems,
    currentCartDetails
  } = useControlCart()

  const primaryDistance = useMemo(() => distance.find((d) => d.warehouseId > 0)?.warehouseId || null, [distance]);

  const fetchDistanceData = async () => {
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

  const checkProjectGeolocation = async () => {
    if (selectedProject) {
      if (selectedProject.latitude === 0 || selectedProject.longitude === 0) {
        return false;
      } else {
        return true;
      }
    }
  };

  const totalInvoice = useMemo(() => {
    return 100000;
  }, []);

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

  const setBranchMode = useCallback((isBranch: boolean) => {
    setIsBranchDelivery(isBranch);
    useControlCart.setState(state => ({
      currentCartDetails: state.currentCartDetails
        ? { ...state.currentCartDetails, branchCenterDelivery: isBranch }
        : null
    }));
  }, []);

  const onProjectSwitch = useCallback((_e: React.SyntheticEvent, checked: boolean) => {

    setBranchMode(!checked);
  }, [setBranchMode]);

  const onBranchSwitch = useCallback((_e: React.SyntheticEvent, checked: boolean) => {
    setBranchMode(checked);
  }, [setBranchMode]);


  const handledeliveryMethodBot = (
    event: React.MouseEvent<HTMLElement>,
    newdeliveryMethodBot: string | null,
  ) => {
    setDeliveryMethodBot(newdeliveryMethodBot);
  };

  const handleWarehouseChange = useCallback(
    (newValue: Warehouse | null) => {
      setSelectedCartWarehouse(newValue);


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
      setDeliverySource(newSource);
      useControlCart.setState(state => ({
        currentCartDetails: state.currentCartDetails
          ? { ...state.currentCartDetails, transit: isTransit }
          : null
      }));

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
    [primaryDistance, JSON.stringify(Warehouse.map(w => w.id))]
  );

  const handleCloseCart = () => {
    cartClose();
    console.log("Cart closed", openCart);
  };

  // Helper function to generate consistent item keys
  const getItemKey = useCallback((item: ItemResaultPrice): string => {
    return `${item.ididentity}-${item.warehouseId}`;
  }, []);

  // Helper function to refine shipments (remove empty ones)
  const refineShipments = useCallback((items: ItemResaultPrice[]) => {
    const shipmentsWithItems = new Set(
      items.map(item => item.tempShipmentId).filter((id): id is number => id !== null)
    );

    cartShipments.forEach(shipment => {
      if (!shipmentsWithItems.has(shipment.id)) {
        console.log(`🗑️ Removing empty shipment: ${shipment.id}`);
        removeShipment(shipment.id);
      }
    });
  }, [cartShipments, removeShipment]);

  useEffect(() => {
    if (cartProducts.length === 0) {
      setRawItems([]);
      return;
    }
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
    if (!isCartOpen || isBranchDelivery || !primaryDistance || Warehouse.length === 0) {
      return;
    }

    const matchedWarehouse = Warehouse.find(wh => wh.id === primaryDistance) || null;

    if (!matchedWarehouse) {
      setSelectedCartWarehouse(null);
      return;
    }

    setSelectedCartWarehouse(matchedWarehouse);

    cartShipments.forEach(s => removeShipment(s.id));

    const newShipmentId = addShipment({
      warehouseId: matchedWarehouse.id,
      deliveryMethod: null,
      deliveryDate: null,
    });

    const updatedItems = rawItems.map(item => ({
      ...item,
      tempShipmentId: newShipmentId
    }));

    setRawItems(updatedItems);

    useControlCart.setState(state => ({
      currentCartDetails: state.currentCartDetails
        ? { ...state.currentCartDetails, warehouseId: matchedWarehouse.id }
        : null
    }));
  }, [isCartOpen, isBranchDelivery, primaryDistance, Warehouse, isFetchingDistance]);

  useEffect(() => {
    if (selectedAccount && connectedProjects.length > 0) {
      const combinedProjects = connectedProjects.map((project) => ({
        title: `${selectedAccount.title} - ${project.title}`,
        id: project.id,
      }));
      setProjectTitles(combinedProjects);
    }

    if (selectedProject && projectTitles.length > 0) {
      const matchedProject = projectTitles.find(pt => pt.id === selectedProject.id);
      if (matchedProject && !selectedProjectState) {
        setSelectedProjectState(matchedProject);
      }
    }
  }, [
    selectedAccount,
    connectedProjects,
    isBranchDelivery,
    Warehouse.length,
    projectTitles,
    selectedProjectState
  ]);

  useEffect(() => {
    if (!currentCartDetails) return;
    const branchCenterDelivery = currentCartDetails.branchCenterDelivery;
    console.log('🔄 Setting isBranchDelivery from currentCartDetails:', branchCenterDelivery);
    setIsBranchDelivery(branchCenterDelivery);

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
  }, [currentCartDetails]);


  useEffect(() => {
    if (!currentCartDetails || !connectedProjects.length || !selectedAccount) return;
    if (!isBranchDelivery && Warehouse.length === 0) return;

    const { projectIdCustomer, transit, warehouseId } = currentCartDetails;

    const matchedProject = connectedProjects.find(p => p.id === projectIdCustomer);
    if (matchedProject) {
      const projectOption = {
        title: `${selectedAccount.title} - ${matchedProject.title}`,
        id: matchedProject.id,
      };
      setSelectedProject(matchedProject);
      setSelectedProjectState(projectOption);
    }

    const deliverySourceLabel = transit ? 'مستقیم از کارخانه' : 'از انبار';
    setDeliverySource(deliverySourceLabel);

    if (!transit && warehouseId) {
      const matchedWh = Warehouse.find(wh => wh.id === warehouseId);
      if (matchedWh) {
        setSelectedCartWarehouse(matchedWh);
      }
    }
  }, [
    currentCartDetails,
    isBranchDelivery,
    connectedProjects,
    selectedAccount,
    Warehouse
  ]);


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
            <FormControlLabel
              checked={!isBranchDelivery}
              onChange={onProjectSwitch}
              control={<Switch size="small" color="info" />}
              label="ارسال به پروژه"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Box>
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel
              checked={isBranchDelivery}
              onChange={onBranchSwitch}
              control={<Switch size="small" color="info" />}
              label="تحویل درب انبار"
              sx={{ whiteSpace: 'nowrap' }}
            />
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
              value={selectedProjectState}
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
                    (item) => item.tempShipmentId === shipment.id
                  );

                  // If no items in this shipment, skip rendering entirely
                  if (itemsInShipment.length === 0) {
                    return null;
                  }

                  return (
                    <React.Fragment key={`shipment-${shipment.id}`}>
                      {itemsInShipment.map((item, itemIndex) => {
                        const itemKey = getItemKey(item);
                        const isChecked = selectedItemKeys.has(itemKey);
                        const hasDiscount = item.discountPriceWarehouse > 0;
                        const basePrice = item.priceWarehouse;
                        const finalPrice = hasDiscount ? item.discountPriceWarehouse : basePrice;
                        const quantity = item.value || 1;
                        const total = finalPrice * quantity;

                        return (
                          <TableRow
                            key={itemKey}
                            sx={{
                              '& .MuiTableCell-root': {
                                p: 1.5,
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
                                  <Typography variant="body1" color="primary" fontWeight="bold">
                                    مرسوله {toPersianPrice(shipmentNumber)}
                                  </Typography>
                                  <Box>
                                    <IconButton
                                      color="info"
                                      size="small"
                                      onClick={handleMoveItemModalToggle}
                                      title="جابجایی مرسوله"
                                      disabled={selectedItemKeys.size === 0}
                                    >
                                      <SwapVertRoundedIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      color="error"
                                      size="small"
                                      onClick={handleDeleteItemModalToggle}
                                      title="حذف آیتم از مرسوله"
                                      disabled={selectedItemKeys.size === 0}
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
                                  onChange={() => toggleSelectedItem(item)}
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
                      })}

                      {/* Shipment Details Row - ALWAYS rendered after items */}
                      <TableRow
                        key={`options-${shipment.id}`}
                        sx={{
                          '& .MuiTableCell-root': {
                            p: 1.5,
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
                            options={[]}
                            label="شیوه تحویل"
                          />
                        </TableCell>
                        <TableCell>
                          <Combo
                            value={deliveryTime}
                            onChange={setDeliveryTime}
                            options={[]}
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
                    </React.Fragment>
                  );
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
        onUpdate={(updatedItems) => {
          setRawItems(updatedItems);
          // Clear selections after move
          clearSelectedItems();
          // Refine shipments (remove empty ones)
          refineShipments(updatedItems);
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