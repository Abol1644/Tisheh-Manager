import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react'
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
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';

import usePersianNumbers from '@/hooks/usePersianNumbers';
import NumberField from '@/components/elements/NumberField';
import Combo from '@/components/elements/Combo';
import { RialIcon } from '@/components/elements/TomanIcon';
import MoveItemModal from '@/pages/Dashboard/Sales/Modals/MoveItemModal';
import DeleteModal from '@/pages/Dashboard/Sales/Modals/DeleteModal';
import BaseModal from '@/pages/Dashboard/Sales/Modals/BaseModal';
import PaymentModal from '@/pages/Dashboard/Sales/Modals/PaymentModal';
import { flex, size } from '@/models/ReadyStyles';

import dayjs from "@/utils/dayjs-jalali";
import { useSnackbar } from "@/contexts/SnackBarContext";
import { useDeliveryTimeOptions } from '@/hooks/useDeliveryTimeOptions';
import {
  useAccountStore,
  useProjectStore,
  useBranchDeliveryStore,
  useControlCart,
  useDistanceStore,
  useProductsStore
} from '@/stores';
import {
  getWarehouses,
  getConnectedProject,
  getTransportCartListSale,
  findAccount,
  getGeoFence,
  getCart,
  findWarehouse,
  getListOfCartItems
} from '@/api';
import {
  Warehouse,
  ItemResaultPrice,
  Project,
  GeoFence,
  ListCart,
  CartDetails,
  TransportList,
  Account,
  Distance
} from '@/models'

interface CartProps {
  setOpenCart: (value: boolean) => void;
  openCart: boolean;
}

export interface DeliveryTimeOption {
  id: string; // "day-3-slot-8-13"
  label: string;
  dayIndex: number; // 0-6
  startHour: number;
  endHour: number;
}


const deliverySources = [
  { id: 1, method: 'از انبار' },
  { id: 2, method: 'مستقیم از کارخانه' }
];

const deliverySourceLabels = deliverySources.map(a => a.method);

export function Cart({ setOpenCart, openCart }: CartProps) {

  const [selectedProjectState, setSelectedProjectState] = useState<{ title: string; id: number } | null>(null);
  const [vehicleOptions, setVehicleOptions] = useState<{ title: string; id: number }[]>([]);
  const [connectedProjects, setConnectedProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deliverySource, setDeliverySource] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [cashPay, setCashPay] = useState(false);
  const [rawItems, setRawItems] = useState<ItemResaultPrice[]>([]);

  const [moveItemModal, setMoveItemModal] = useState(false);
  const [deleteItemModal, setDeleteItemModal] = useState(false);
  const [confirmOrderModal, setConfirmOrderModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const prevCartIdRef = useRef<number | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<{ id: number; title: string } | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTimeOption | null>(null);
  const [services, setServices] = useState(0);
  const [deliveryMethodBot, setDeliveryMethodBot] = useState<string | null>('manual');
  const [geofence, setgeofence] = useState<GeoFence | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | undefined>(undefined);
  const [currentAccount, setCurrentAccount] = useState<Account | undefined>(undefined);

  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const { isBranchDelivery, setIsBranchDelivery } = useBranchDeliveryStore();
  const { distance, fetchDistance } = useDistanceStore();
  const { showSnackbar, closeSnackbarById } = useSnackbar();
  const { toPersianPrice } = usePersianNumbers();
  const { selectedWarehouse } = useProductsStore();

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
    setCartProducts,
    selectedCartId,
    setCurrentCartDetails,
    cartList,
    setIsFetchingItems
  } = useControlCart();

  const projectTitles = useMemo(() => {
    if (!selectedAccount || connectedProjects.length === 0) return [];

    return connectedProjects.map((project) => ({
      title: `${selectedAccount.title} - ${project.title}`,
      id: project.id,
    }));
  }, [selectedAccount, connectedProjects]);

  const filteredItems = useMemo(() => {
    if (!selectedCartWarehouse) return [];
    return rawItems.filter(item => item.warehouseId === selectedCartWarehouse.id);
  }, [rawItems, selectedCartWarehouse]);

  const deliveryTimeOptions = useDeliveryTimeOptions({
    items: filteredItems,
    isTransitMode: !!currentCartDetails?.transit,
    selectedDeliveryMethod: deliveryMethod
  });

  const totalInvoice = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      const price = item.discountPriceWarehouse > 0
        ? item.discountPriceWarehouse
        : item.priceWarehouse;
      return sum + (price * (item.value || 1));
    }, 0);
  }, [filteredItems]);

  const getItemKey = useCallback((item: ItemResaultPrice): string => {
    return `${item.ididentity}-${item.warehouseId}-${item.tempShipmentId ?? 'null'}`;
  }, []);

  const refineShipments = useCallback((items: ItemResaultPrice[]) => {
    const shipmentsWithItems = new Set(
      items.map(item => item.tempShipmentId).filter((id): id is number => id !== null)
    );

    cartShipments.forEach(shipment => {
      if (!shipmentsWithItems.has(shipment.id)) {

        removeShipment(shipment.id);
      }
    });
  }, [cartShipments, removeShipment]);

  const setProjectAccount = async (cartList: ListCart | null) => {
    if (!cartList) {
      // console.log("Cart not ready");
      return;
    }
    const account = await findAccount(cartList.codeAccCustomer);
    setSelectedAccount(account);
    setCurrentAccount(account);

    const projects = await getConnectedProject(cartList.branchCenterDelivery, account.codeAcc);
    setConnectedProjects(projects);

    const matchedProject = projects.find(p => p.id === cartList.projectIdCustomer);
    setCurrentProject(matchedProject);

    if (matchedProject && account) {
      setSelectedProjectState({
        title: `${account.title} - ${matchedProject.title}`,
        id: matchedProject.id
      });
      setSelectedProject(matchedProject);
    }
  }

  const getWarehouseList = async () => {
    try {
      setWarehousesLoading(true);
      const warehouseList = await getWarehouses();
      setWarehouses(warehouseList);
    } finally {
      setWarehousesLoading(false);
    }
  }

  const getCartDetails = useCallback(async (cartId: number | null): Promise<CartDetails | null> => {
    if (cartId === null) return null;
    try {
      const details = await getCart(cartId);
      setCurrentCartDetails(details);
      return details;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [setCurrentCartDetails]);

  const setTransitList = (cartList: ListCart | null) => {
    const isTransit = cartList?.transit;
    const sourceLabel = isTransit ? 'مستقیم از کارخانه' : 'از انبار';
    setDeliverySource(sourceLabel);
  }

  const setBranchDelivery = (cartList: ListCart | null) => {
    const isBranch = cartList?.branchCenterDelivery;
    if (isBranch) {
      setIsBranchDelivery(true);
    } else {
      setIsBranchDelivery(false);
    }
  }

  const getNearestWarehouse = async (cartList: ListCart | null, project: Project | undefined, listWarehouses: Warehouse[]) => {
    const warehouseId = cartList?.warehouseId;
    try {
      if (isBranchDelivery) {
        const targetWarehouse = listWarehouses.find(wh => wh.id === warehouseId) ||
          (listWarehouses.length > 0 ? listWarehouses[0] : null);
        if (targetWarehouse) setSelectedCartWarehouse(targetWarehouse);
      } else {

        if (project?.latitude === 0 || project?.longitude === 0 || !listWarehouses) {
          showSnackbar('مختصات جغرافیایی پروژه وارد نشده است', 'warning', 5000, <ErrorOutlineRoundedIcon />);
          return;
        }

        if (!isBranchDelivery && project && project.latitude !== 0 && project.longitude !== 0) {
          setDistanceLoading(true);

          let distances: Distance[] = [];
          try {
            distances = await findDistance();
          } catch (error) {
            showSnackbar("محاسبه فاصله ناموفق بود", "error", 5000, <ErrorOutlineRoundedIcon />);
            return;
          }

          const primaryDistance = distances.find((d) => d.warehouseId > 0)?.warehouseId || null;
          const targetWarehouse = listWarehouses.find(wh => wh.id === primaryDistance)
          if (targetWarehouse) {
            setSelectedCartWarehouse(targetWarehouse);
            // showSnackbar(`انبار با موفقیت انتخاب شد ${targetWarehouse?.title}`, 'info', 1000, <InfoRoundedIcon />);
          } else {
            showSnackbar('انبار مناسب پیدا نشد', 'warning', 3000, <ErrorOutlineRoundedIcon />);
            return;
          }
          setDistanceLoading(false);
        } else if (!project) {
          // console.log("🥐🥐 Missing required data for initializeCart calc", { project });
          showSnackbar('خطا در دریافت اطلاعات', 'warning', 3000, <ErrorOutlineRoundedIcon />);
        }
      }
    } catch (error: any) {
      console.error('❌ Cart init failed:', error);
      showSnackbar(error.message || 'خطا در بارگذاری سبد خرید', 'error', 5000, <ErrorOutlineRoundedIcon />);
    } finally {
      setProjectsLoading(false);
      setWarehousesLoading(false);
      setDistanceLoading(false);
    }
  }

  const getCartItems = (cart: ListCart | null) => {
    setIsFetchingItems(true);
    getListOfCartItems(cart)
      .then((data: ItemResaultPrice[]) => {
        // console.log('Fetched cart items:', data);
        setCartProducts(data);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
      })
      .finally(() => {
        setIsFetchingItems(false);
      });
  }

  const clearCartDetails = () => {
    setRawItems([]);
    setCartProducts([]);
    cartShipments.forEach(s => removeShipment(s.id));
    clearSelectedItems();
    setSelectedCartWarehouse(null);
    setSelectedProjectState(null);
    setConnectedProjects([]);
    setDeliverySource(null);
  }

  useEffect(() => {
    if (!isCartOpen) {
      clearCartDetails();
    }
  }, [isCartOpen])

  useEffect(() => {
    if (cartProducts.length === 0) {
      setRawItems([]);
    } else {
      setRawItems(cartProducts);
      // showSnackbar(`موفقیت آمیز ${rawItems.length}`, 'success', 5000, <InfoRoundedIcon />);

    }
  }, [cartProducts])

  useEffect(() => {
    console.log("😌 ~ Cart ~ filteredItems:", filteredItems)

  }, [filteredItems])

  const getVehicleId = async (items: ItemResaultPrice[], warehouse: Warehouse | null, project: Project | undefined) => {
    let geofence: GeoFence | null = null;
    if (project) {
      try {
        geofence = await getGeoFence(project);
        // showSnackbar("در حال دریافت جئو", 'error', 5000, <ErrorOutlineRoundedIcon />);
        setgeofence(geofence);
      } catch (error: any) {
        const errorMessage = error.response?.data || error.message || 'خطا در دریافت محدوده جغرافیایی';
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
        return;
      }
    }

    if (!geofence || !warehouse || !project) {
      // console.log("🗺 Missing required data for transport calc", { geofence, warehouse, project });
      return;
    }

    try {
      // console.log("👚🎒 ~ Cart ~ null", items, geofence, distance, isBranchDelivery, warehouse.id, currentCartDetails?.transit, )
      const data: TransportList = await getTransportCartListSale(
        null,
        items,
        geofence,
        distance,
        isBranchDelivery,
        warehouse.id,
        currentCartDetails?.transit,
        project
      );

      console.log("🚛 Transport Data:", data);

      if (data.listItemVehicleShipp && data.listItemVehicleShipp.length > 0) {
        const filteredVehicles = data.listItemVehicleShipp.filter((vehicle) => {
          const isTransitMode = !!currentCartDetails?.transit;
          return isTransitMode || !vehicle.transit;
        });

        const mapped = filteredVehicles.map((v) => ({
          id: v.vehicleId,
          title: `${v.vehicleTitle}`
        }));
        setVehicleOptions(mapped);

        if (deliveryMethod && !mapped.some(opt => opt.id === deliveryMethod.id)) {
          setDeliveryMethod(null);
        }
      } else {
        setVehicleOptions([]);
        setDeliveryMethod(null);
      }
    } catch (error: any) {
      console.error("🚚 Transport calculation failed:", error);
      showSnackbar(
        error.message || 'محاسبه وسایل نقلیه ارسال با خطا مواجه شد',
        'error',
        6000,
        <ErrorOutlineRoundedIcon />
      );
    }
  };

  const findDistance = async (): Promise<Distance[]> => {
    try {
      const distances = await fetchDistance(selectedProject);
      // console.log("Found distances:", distances);
      return distances;
    } catch (error) {
      console.error("Failed to get distances:", error);
      return [];
    }
  };

  useEffect(() => {
    if (!selectedCartId || selectedCartId === 0) {
      clearCartDetails();
    }
    getCartDetails(selectedCartId);

  }, [selectedCartId])

  useEffect(() => {
    if (!cartList || cartProducts.length > 0 || isFetchingItems) {
      return;
    }
    getCartItems(cartList);
    // setRawItemsList();

  }, [cartProducts, isFetchingItems, cartList])

  useEffect(() => {
    if (!cartList) {
      return;
    }
    setBranchDelivery(cartList);
    setTransitList(cartList);
    setProjectAccount(cartList);
  }, [cartList])

  useEffect(() => {
    if (warehouses.length >= 1) { return; }
    getWarehouseList();
  }, [])

  useEffect(() => {
    if (!warehouses || !cartList || !currentProject) {
      return;
    }

    if (warehouses && cartList && currentProject) {
    }

    getNearestWarehouse(cartList, currentProject, warehouses);

  }, [warehouses, cartList, currentProject])

  useEffect(() => {
    if (rawItems.length <= 0 || !selectedCartWarehouse || !currentProject || !selectedProject) {
      // console.log("⏸️ Waiting for all values:", { rawItems, selectedCartWarehouse, currentProject, selectedProject });
      // console.log("%cno items", 'color: red', { rawItems });
      return;
    }
    getVehicleId(rawItems, selectedCartWarehouse, currentProject);
    // console.log("✅ all values:", rawItems, selectedCartWarehouse.id, currentProject);
  }, [rawItems, selectedCartWarehouse, currentProject, selectedProject]);

  useEffect(() => {
    if (
      rawItems.length === 0 ||
      cartShipments.length > 0 ||
      !selectedCartWarehouse
    ) {
      return;
    }

    const shipmentId = addShipment({
      warehouseId: selectedCartWarehouse.id,
      deliveryMethod: null,
      deliveryDate: null,
    });

    const updatedItems = rawItems.map(item => ({
      ...item,
      tempShipmentId: shipmentId
    }));
    setRawItems(updatedItems);
  }, [rawItems.length, cartShipments.length, selectedCartWarehouse]);

  // Auto-select best delivery time when deliveryMethod is chosen
  useEffect(() => {
    if (deliveryMethod && !deliveryTime && deliveryTimeOptions.length > 0) {
      const now = dayjs();
      const currentHour = now.hour();

      // Find best option: prefer morning slot if before 13, else afternoon
      let selectedOption = null;

      // Try to find a valid "today" option (i.e., delivered 0 days from now)
      const availableTodayOptions = deliveryTimeOptions.filter(opt => opt.daysFromToday === 0);

      if (availableTodayOptions.length > 0) {
        if (currentHour < 13) {
          selectedOption = availableTodayOptions.find(opt => opt.startHour === 8 && opt.endHour === 13);
        } else if (currentHour < 18) {
          selectedOption = availableTodayOptions.find(opt => opt.startHour === 13 && opt.endHour === 18);
        }
      }

      // Fallback: first available option (could be tomorrow)
      setDeliveryTime(selectedOption || deliveryTimeOptions[0]);
    }
  }, [deliveryMethod, deliveryTimeOptions, deliveryTime]);

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

  const deleteSelectedItems = useCallback(() => {
    const { selectedItemKeys } = useControlCart.getState();

    if (selectedItemKeys.size === 0) return;

    // Compute keys to delete
    const keysToDelete = Array.from(selectedItemKeys);

    // Update rawItems (local state)
    setRawItems(prev => {
      const updated = prev.filter(item => {
        const key = getItemKey(item);
        return !keysToDelete.includes(key);
      });
      return updated;
    });

    const updatedCart = cartProducts.filter(item => {
      const key = getItemKey(item);
      return !keysToDelete.includes(key);
    });
    setCartProducts(updatedCart);

    // Now clean up empty shipments
    setTimeout(() => {
      refineShipments(
        useControlCart.getState().products.filter(item => {
          const key = getItemKey(item);
          return !keysToDelete.includes(key);
        })
      );
    }, 0);

    clearSelectedItems();
    setDeleteItemModal(false);
    showSnackbar('آیتم‌ها حذف شدند', 'success', 3000, <DoneAllRoundedIcon />);
  }, [getItemKey, refineShipments, clearSelectedItems, showSnackbar, cartProducts, setCartProducts]);

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
    setPaymentModal(true);
    handleConfirmModalToggle();
  }, [handleConfirmModalToggle]);

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
              // @ts-ignore
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'fit-content',
            }}
          >
            <Checkbox
              checked={cashPay}
              onChange={(e) => setCashPay(e.target.checked)}
              icon={<PaidOutlinedIcon />}
              checkedIcon={<PaidRoundedIcon />}
            />
            <Typography variant='subtitle1'>
              نقدی
            </Typography>
          </Box>
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
                            onChange={(newValue) => {
                              // newValue is either { id, title } or null
                              setDeliveryMethod(newValue);
                            }}
                            options={vehicleOptions}
                            // @ts-ignore
                            getOptionLabel={(option) => option.title}
                            // @ts-ignore
                            getOptionValue={(option) => option.id}
                            label="شیوه تحویل"
                            loading={distanceLoading || !vehicleOptions.length}
                            disabled={!vehicleOptions.length}
                          />
                        </TableCell>
                        <TableCell>
                          <Combo
                            value={deliveryTime}
                            onChange={setDeliveryTime}
                            options={deliveryTimeOptions}
                            // @ts-ignore
                            getOptionLabel={(option) => option.label}
                            // @ts-ignore
                            getOptionValue={(option) => option.id}
                            label="زمان تحویل"
                            placeholder="زمان تحویل را انتخاب کنید"
                            disabled={!deliveryMethod || deliveryTimeOptions.length === 0}
                            loading={!deliveryMethod ? false : !deliveryTimeOptions.length}
                            noOptionsText={deliveryMethod ? "زمانی برای تحویل موجود نیست" : "ابتدا شیوه تحویل را انتخاب کنید"}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ ...flex.row, ...flex.alignCenter, gap: 2, width: 'fit-content' }}>
                            <NumberField
                              value={services}
                              onChange={() => { }}
                              disabled
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
      <BaseModal
        open={deleteItemModal}
        onClose={() => setDeleteItemModal(false)}
        title="حذف آیتم‌های انتخابی"
        info={`آیا از حذف ${selectedItemKeys.size} آیتم مطمئن هستید؟`}
        buttonText="حذف definitively"
        buttonColor="error"
        windowColor="error"
        buttonFunc={deleteSelectedItems}
        width="400px"
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