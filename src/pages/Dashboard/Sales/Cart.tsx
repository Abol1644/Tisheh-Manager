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
import { getWarehouses, getConnectedProject } from '@/api';
import { Warehouse, ItemResaultPrice, Project } from '@/models'

interface CartProps {
  setOpenCart: (value: boolean) => void;
  openCart: boolean;
}

const deliverySources = [
  { id: 1, method: 'از انبار' },
  { id: 2, method: 'مستقیم از کارخانه' }
];

const deliverySourceLabels = deliverySources.map(a => a.method);

export function Cart({ setOpenCart, openCart }: CartProps) {
  // ===== LOCAL STATE =====
  const [selectedProjectState, setSelectedProjectState] = useState<{ title: string; id: number } | null>(null);
  const [connectedProjects, setConnectedProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deliverySource, setDeliverySource] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [rawItems, setRawItems] = useState<ItemResaultPrice[]>([]);

  // Modal states
  const [moveItemModal, setMoveItemModal] = useState(false);
  const [deleteItemModal, setDeleteItemModal] = useState(false);
  const [confirmOrderModal, setConfirmOrderModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  // Unused states for future implementation
  const [deliveryMethod, setDeliveryMethod] = useState<string[]>([]);
  const [deliveryTime, setDeliveryTime] = useState<string[]>([]);
  const [services, setServices] = useState(0);
  const [deliveryMethodBot, setDeliveryMethodBot] = useState<string | null>('manual');

  // ===== ZUSTAND STORES =====
  const { selectedAccount } = useAccountStore();
  const { selectedProject, setSelectedProject } = useProjectStore();
  const { isBranchDelivery, setIsBranchDelivery } = useBranchDeliveryStore();
  const { distance, fetchDistance } = useDistanceStore();
  const { showSnackbar, closeSnackbarById } = useSnackbar();
  const { toPersianPrice } = usePersianNumbers();

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
    currentCartDetails,
    setCartProducts
  } = useControlCart();

  // ===== COMPUTED VALUES =====
  const primaryDistance = useMemo(
    () => distance.find((d) => d.warehouseId > 0)?.warehouseId || null,
    [distance]
  );

  const projectTitles = useMemo(() => {
    if (!selectedAccount || connectedProjects.length === 0) return [];
    // if (!selectedAccount) return [];
    return connectedProjects.map((project) => ({
      title: `${selectedAccount.title} - ${project.title}`,
      id: project.id,
    }));
  }, [selectedAccount, connectedProjects]);

  const filteredItems = useMemo(() => {
    if (!selectedCartWarehouse) return [];
    return rawItems.filter(item => item.warehouseId === selectedCartWarehouse.id);
  }, [rawItems, selectedCartWarehouse]);

  const totalInvoice = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      const price = item.discountPriceWarehouse > 0
        ? item.discountPriceWarehouse
        : item.priceWarehouse;
      return sum + (price * (item.value || 1));
    }, 0);
  }, [filteredItems]);

  // ===== HELPER FUNCTIONS =====
  const getItemKey = useCallback((item: ItemResaultPrice): string => {
    return `${item.ididentity}-${item.warehouseId}`;
  }, []);

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

  // ===== MAIN INITIALIZATION =====
  // Step 1: When currentCartDetails changes, initialize everything
  useEffect(() => {
    if (!currentCartDetails) return;

    console.log('🧹 Clearing previous cart data');
    setRawItems([]);
    setCartProducts([]);
    cartShipments.forEach(s => removeShipment(s.id));
    clearSelectedItems();
    setSelectedCartWarehouse(null);
    setSelectedProjectState(null);
    setConnectedProjects([]);
    setDeliverySource(null);

    console.log('🎯 Initializing cart from currentCartDetails:', currentCartDetails);

    const initializeCart = async () => {
      const {
        branchCenterDelivery,
        warehouseId,
        projectIdCustomer,
        transit,
        codeAccCustomer
      } = currentCartDetails;

      // Set delivery mode
      setIsBranchDelivery(branchCenterDelivery);

      // Set delivery source
      const sourceLabel = transit ? 'مستقیم از کارخانه' : 'از انبار';
      setDeliverySource(sourceLabel);

      if (branchCenterDelivery) {
        // ===== BRANCH DELIVERY MODE =====
        console.log('📦 Branch Delivery Mode');

        // Fetch warehouses
        if (warehouses.length === 0) {
          setWarehousesLoading(true);
          try {
            const warehouseList = await getWarehouses();
            setWarehouses(warehouseList);

            // Set selected warehouse from currentCartDetails
            const targetWarehouse = warehouseList.find(wh => wh.id === warehouseId);
            if (targetWarehouse) {
              setSelectedCartWarehouse(targetWarehouse);
              console.log('✅ Selected warehouse:', targetWarehouse.title);
            }
          } catch (error) {
            console.error('❌ Error fetching warehouses:', error);
            showSnackbar('خطا در دریافت انبارها', 'error', 5000, <ErrorOutlineRoundedIcon />);
          } finally {
            setWarehousesLoading(false);
          }
        }

      } else {
        // ===== PROJECT DELIVERY MODE =====
        console.log('🚚 Project Delivery Mode');

        // Fetch connected projects
        // if (selectedAccount && connectedProjects.length === 0) {
        if (selectedAccount) {
          setProjectsLoading(true);
          try {
            const projects = await getConnectedProject(true, selectedAccount.codeAcc);
            setConnectedProjects(projects);
            console.log("🚀 ~ initializeCart ~ projects:", projects)

            // Set selected project
            const targetProject = projects.find(p => p.id === projectIdCustomer);
            if (targetProject) {
              setSelectedProject(targetProject);
              setSelectedProjectState({
                title: `${selectedAccount.title} - ${targetProject.title}`,
                id: targetProject.id
              });
              console.log('✅ Selected project:', targetProject.title);

              // Check geolocation
              if (targetProject.latitude === 0 || targetProject.longitude === 0) {
                showSnackbar('مختصات جغرافیایی پروژه وارد نشده است', 'warning', 5000, <ErrorOutlineRoundedIcon />);
                return;
              }

              // Fetch distance and warehouses
              setDistanceLoading(true);
              const loadingSnackbarId = showSnackbar('درحال پردازش نزدیکترین انبار', 'info', 0, <InfoRoundedIcon />);

              try {
                await fetchDistance();
                closeSnackbarById(loadingSnackbarId);
                showSnackbar('انبار پردازش شد', 'success', 3000, <DoneAllRoundedIcon />);
              } catch (error: any) {
                closeSnackbarById(loadingSnackbarId);
                const errorMessage = error.response?.data || error.message || 'خطا در دریافت فاصله';
                showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
              } finally {
                setDistanceLoading(false);
              }

            } else {
              console.warn('⚠️ Project not found in connected projects');
            }

          } catch (error: any) {
            console.error('❌ Error fetching connected projects:', error);
            showSnackbar('خطا در دریافت پروژه های متصل', 'error', 5000, <ErrorOutlineRoundedIcon />);
          } finally {
            setProjectsLoading(false);
          }
        }

        // Fetch warehouses for project mode too
        if (warehouses.length === 0) {
          setWarehousesLoading(true);
          try {
            const warehouseList = await getWarehouses();
            setWarehouses(warehouseList);
          } catch (error) {
            console.error('❌ Error fetching warehouses:', error);
          } finally {
            setWarehousesLoading(false);
          }
        }
      }
    };

    initializeCart();
  }, [currentCartDetails]); // Only trigger when currentCartDetails changes

  // Step 2: When distance is fetched, select nearest warehouse
  useEffect(() => {
    if (isBranchDelivery || !primaryDistance || warehouses.length === 0 || distanceLoading) {
      return;
    }

    console.log('📍 Primary distance found:', primaryDistance);

    const nearestWarehouse = warehouses.find(wh => wh.id === primaryDistance);
    if (nearestWarehouse) {
      setSelectedCartWarehouse(nearestWarehouse);
      console.log('✅ Auto-selected nearest warehouse:', nearestWarehouse.title);
    }
  }, [primaryDistance, warehouses, isBranchDelivery, distanceLoading]);

  // Step 3: Sync cartProducts to rawItems
  useEffect(() => {
    if (cartProducts.length === 0) {
      setRawItems([]);
      return;
    }

    // If items don't have tempShipmentId, we'll assign them in the next effect
    setRawItems(cartProducts);
  }, [cartProducts]);

  // Step 4: Create initial shipment for all items (only once when items load)
  useEffect(() => {
    if (
      rawItems.length === 0 ||
      cartShipments.length > 0 ||
      !selectedCartWarehouse
    ) {
      return;
    }

    console.log('🎬 Creating initial shipment for all items');

    const shipmentId = addShipment({
      warehouseId: selectedCartWarehouse.id,
      deliveryMethod: null,
      deliveryDate: null,
    });

    // Assign all items to this shipment
    const updatedItems = rawItems.map(item => ({
      ...item,
      tempShipmentId: shipmentId
    }));

    setRawItems(updatedItems);
    console.log(`✅ Created shipment ${shipmentId} with ${updatedItems.length} items`);

  }, [rawItems.length, cartShipments.length, selectedCartWarehouse]);

  // ===== EVENT HANDLERS =====
  const handleBranchSwitch = useCallback((event: React.SyntheticEvent, checked: boolean) => {
    setIsBranchDelivery(checked);
  }, [setIsBranchDelivery]);

  const handleProjectSwitch = useCallback((event: React.SyntheticEvent, checked: boolean) => {
    setIsBranchDelivery(!checked);
  }, [setIsBranchDelivery]);

  const handleWarehouseChange = useCallback((newValue: Warehouse | null) => {
    setSelectedCartWarehouse(newValue);
  }, [setSelectedCartWarehouse]);

  const handleProjectChange = useCallback((newValue: { title: string; id: number } | null) => {
    if (!newValue) return;

    setSelectedProjectState(newValue);

    const project = connectedProjects.find(p => p.id === newValue.id);
    if (project) {
      setSelectedProject(project);
    }
  }, [connectedProjects, setSelectedProject]);

  const handleDeliverySourceChange = useCallback((newSource: string | null) => {
    setDeliverySource(newSource);
  }, []);

  const handledeliveryMethodBot = useCallback((
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    setDeliveryMethodBot(newValue);
  }, []);

  const handleCloseCart = useCallback(() => {
    cartClose();
  }, [cartClose]);

  const handleMoveItemModalToggle = useCallback(() => {
    setMoveItemModal(prev => !prev);
  }, []);

  const handleDeleteItemModalToggle = useCallback(() => {
    setDeleteItemModal(prev => !prev);
  }, []);

  const handleConfirmModalToggle = useCallback(() => {
    setConfirmOrderModal(prev => !prev);
  }, []);

  const handlePaymentModalToggle = useCallback(() => {
    setPaymentModal(prev => !prev);
  }, []);

  const confirmOrder = useCallback(() => {
    console.log('Order confirmed');
    setPaymentModal(true);
    handleConfirmModalToggle();
  }, [handleConfirmModalToggle]);

  // ===== RENDER =====
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...size.full
      }}
    >
      {/* HEADER */}
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
        {/* SWITCHES */}
        <Box sx={{ ...flex.columnStart }}>
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel
              checked={!isBranchDelivery}
              onChange={handleProjectSwitch}
              control={<Switch size="small" color="info" />}
              label="ارسال به پروژه"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Box>
          <Box sx={{ ...flex.rowStart }}>
            <FormControlLabel
              checked={isBranchDelivery}
              onChange={handleBranchSwitch}
              control={<Switch size="small" color="info" />}
              label="تحویل درب انبار"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Box>
        </Box>

        {/* PROJECT MODE INPUTS */}
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
              onChange={handleProjectChange}
              options={projectTitles}
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
              label="حساب - پروژه"
              getOptionValue={(option) => (typeof option === 'string' ? option : option.id)}
              loading={projectsLoading}
            />
            <Combo
              value={deliverySource}
              onChange={handleDeliverySourceChange}
              options={deliverySourceLabels.map(label => ({ title: label }))}
              label='ارسال به صورت'
              //@ts-ignore
              getOptionValue={(option) => option.title}
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
            />
            <ToggleButtonGroup
              className='sale-button-group'
              value={deliveryMethodBot}
              exclusive
              onChange={handledeliveryMethodBot}
              sx={{ display: isBranchDelivery ? 'none' : 'flex', '& button': { borderRadius: '50px', minWidth: '80px', height: '56px' } }}
            >
              <ToggleButton color='primary' value="auto" disabled><AutoAwesomeRoundedIcon sx={{ mr: 0.5 }} />خودکار</ToggleButton>
              <ToggleButton color='primary' value="manual">دستی <TouchAppRoundedIcon sx={{ ml: 0.5 }} /></ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grow>

        {/* BRANCH MODE INPUTS */}
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
              options={warehouses}
              value={selectedCartWarehouse}
              onChange={handleWarehouseChange}
              loading={warehousesLoading}
              loadingText="در حال بارگذاری..."
              noOptionsText="هیچ گزینه‌ای موجود نیست"
              sx={{ width: '100%', maxWidth: '270px', minWidth: '200px' }}
              label='نام انبار'
            />
          </Box>
        </Grow>

        {/* TOTAL PRICE */}
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

      {/* TABLE */}
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
                cartShipments.map((shipment, shipmentIndex) => {
                  const shipmentNumber = shipmentIndex + 1;
                  const itemsInShipment = filteredItems.filter(
                    (item) => item.tempShipmentId === shipment.id
                  );

                  if (itemsInShipment.length === 0) {
                    return null;
                  }

                  return (
                    <React.Fragment key={`shipment-${shipment.id}`}>
                      {/* ITEM ROWS */}
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
                            {/* SHIPMENT CELL (only on first item) */}
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

                            {/* ITEM NAME */}
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

                            {/* QUANTITY */}
                            <TableCell>
                              <Box sx={{ ...flex.row, ...flex.alignCenter, gap: 2, width: 'fit-content' }}>
                                <NumberField
                                  value={quantity}
                                  onChange={() => { }}
                                  min={0}
                                  step={1.0}
                                  sx={{ maxWidth: '160px', minWidth: '120px' }}
                                />
                                <Typography variant="body2">
                                  {item.valueTitleBase || item.valueTitle || 'عدد'}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* PRICE */}
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

                            {/* TOTAL */}
                            <TableCell>
                              <Typography variant="body1">
                                {toPersianPrice(total)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {/* SHIPMENT OPTIONS ROW */}
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

      {/* FOOTER BUTTONS */}
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

      {/* MODALS */}
      <MoveItemModal
        open={moveItemModal}
        onClose={handleMoveItemModalToggle}
        items={rawItems}
        onUpdate={(updatedItems) => {
          setRawItems(updatedItems);
          clearSelectedItems();
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
  );
}