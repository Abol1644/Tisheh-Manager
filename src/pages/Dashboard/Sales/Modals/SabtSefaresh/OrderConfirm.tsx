import React, { useState, useEffect } from 'react';

import {
  Typography,
  Modal,
  Box,
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
  Zoom, Grow,
  Divider,
  CircularProgress,
  InputLabel,
} from '@mui/material';

import NumberField from '@/components/elements/NumberField';
import Btn, { BtnGroup } from '@/components/elements/Btn';

import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import { RialIcon } from '@/components/elements/TomanIcon';

import usePersianNumbers from '@/hooks/usePersianNumbers';
import { useWeekdays, useFormattedWeekdays, usePreparationTime } from '@/hooks/weekDayConverter';
import { flex, width, gap, height } from '@/models/ReadyStyles';
import { getInventory, getGeoFence, getTransportListSale, addCart, getCartList, addItemToCart } from '@/api';
import { Inventory, GeoFence, TransportList, ItemResaultPrice, TransportItem, ListCart, Cart } from '@/models';
import { useProductsStore, useProjectStore, useBranchDeliveryStore, useDistanceStore, useAccountStore, } from '@/stores';
import { toPersianDigits } from '@/utils/persianNumbers'
import { useSnackbar } from "@/contexts/SnackBarContext";
import { filterVehicleCosts, groupTransportByVehicleAndAlternate } from '@/hooks/filterVehicleCosts';
import { usePriceCalculator, useRoundedPrice } from '@/hooks/usePriceCalculator';
import { Account, Project } from '@/models'

interface OrderConfirmProps {
  selectedTransport: TransportItem | null;
  setSelectedTransport: React.Dispatch<React.SetStateAction<TransportItem | null>>;
}

export default function OrderConfirm({ selectedTransport, setSelectedTransport }: OrderConfirmProps) {
  const [numberOfProduct, setNumberOfProduct] = React.useState(0);
  const [transportloading, setTransportLoading] = useState(true);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [geofence, setgeofence] = useState<GeoFence | null>(null);
  const [transportListSale, setTransportListSale] = useState<TransportList[]>([]);

  const { products, selectedItem, getAvailableUnits, setSelectedItem, selectedWarehouse } = useProductsStore();

  const selectedPeriod = React.useMemo(() => {
    const item = localStorage.getItem('periodData');
    return item ? JSON.parse(item) : {};
  }, []);

  const { selectedProject } = useProjectStore();

  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);

  const [selectedUnit, setSelectedUnit] = useState<ItemResaultPrice | null>(null);
  const availableUnits = selectedItem ? getAvailableUnits(selectedItem.priceId) : [];
  const { distance, setDistance } = useDistanceStore();
  const { showSnackbar } = useSnackbar();

  const primaryDistance = distance.find((d) => d.warehouseId > 0)?.warehouseId;

  React.useEffect(() => {
    if (selectedItem && !selectedUnit && availableUnits.length > 0) {
      const baseUnit = availableUnits.find(unit => unit.valueId === selectedItem.valueIdBase) || availableUnits[0];
      setSelectedUnit(baseUnit);
    }
  }, [selectedItem, availableUnits, selectedUnit]);

  React.useEffect(() => {
    if (selectedTransport && selectedItem) {
      const numericWeight = selectedTransport.capacity * (selectedItem.unitRatio || 1);
      setNumberOfProduct(numericWeight); 
      console.log("🚀 ~ OrderConfirm ~ numericWeight:", numericWeight)
    }
  }, [selectedTransport, selectedItem]);

  React.useEffect(() => {
      console.log("🧮 ~ OrderConfirm ~ numericWeight:", numberOfProduct)
  }, [numberOfProduct]);


  const handleUnitChange = (e: SelectChangeEvent<string>) => {
    const title = e.target.value;
    const unit = availableUnits.find(u => u.valueTitle === title);
    if (unit) {
      setSelectedUnit(unit);
      console.log("🏋️‍♀️ ~ handleUnitChange ~ unit:", selectedUnit)
      setSelectedItem(unit);

    }
  };

  React.useEffect(() => {
    const firstProduct = Array.isArray(products) ? products[0] : products;
    if (!firstProduct) return;

    getInventory(firstProduct, selectedPeriod, 0)
      .then(setInventory)
      .catch((error) => {
        let errorMessage = 'خطا در دریافت موجودی انبار';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      })
  }, [products, selectedPeriod]);

  const fetchGeoFence = async () => {
    if (!selectedProject) return null;

    try {
      const result = await getGeoFence(selectedProject);
      setgeofence(result);
      if (result === null) {
        return null;
      } else {
        return result
      }
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'خطا در دریافت محدوده جغرافیایی';
      showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      return null;
    }
  };

  React.useEffect(() => {
    const fetchAndGetTransport = async () => {
      if (!selectedItem?.priceId || !products.length) return;

      setTransportLoading(true);

      try {
        const fetchedGeofence = await fetchGeoFence();
        console.log("🗺 ~ fetchAndGetTransport ~ fetchedGeofence:", fetchedGeofence)

        const transportListPrice = products.filter((p) => p.priceId === selectedItem.priceId);
        if (!transportListPrice.length) return;

        const data = await getTransportListSale(
          transportListPrice,
          fetchedGeofence,
          distance,
          isBranchDelivery,
          selectedWarehouse?.id,
          selectedProject
        );

        const list = Array.isArray(data) ? data : [data];
        setTransportListSale(list);

        if (list[0]?.listDistance) {
          setDistance(list[0].listDistance);
        }

        const costs = filterVehicleCosts(list, false, false);
        const grouped = groupTransportByVehicleAndAlternate(costs);
        const sorted = Object.values(grouped).sort((a, b) => {
          if (a.transit) return 1;
          if (a.alternate) return 2;
          return b.transit ? -1 : b.alternate ? -2 : 0;
        });

        if (sorted[0]) {
          setSelectedTransport({ ...sorted[0].costs[0], ...sorted[0] } as TransportItem);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data || error.message || 'خطا در دریافت لیست حمل و نقل';
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      } finally {
        setTransportLoading(false);
      }
    };

    fetchAndGetTransport();
  }, [products, isBranchDelivery, selectedItem?.priceId, primaryDistance]);


  return (
    <Box sx={{ width: '100%', ...flex.columnBetween }}>
      <Box>
        <ShipmentTable
          transportList={transportListSale}
          selectedTransport={selectedTransport}
          onSelectTransport={setSelectedTransport}
          selectedUnit={selectedUnit}
          transportloading={transportloading}
          selectedItem={selectedItem}
        />
        <OrderOptions
          inventory={inventory}
          transportList={transportListSale}
          selectedId={selectedTransport?.vehicleId || null}
          selectedAlternate={selectedTransport?.alternate || false}
          selectedTransit={selectedTransport?.transit || false}
          geofence={geofence}
          selectedItem={selectedItem}
        />
      </Box>
      <Box>
        <Box sx={{ ...flex.rowBetween, ...width.full, ...gap.ten }}>
          <OrderInput
            maxInventory={inventory?.fullInvestory ?? undefined}
            selectedUnit={selectedUnit}
            onUnitChange={handleUnitChange}
            availableUnits={availableUnits}
            numberOfProduct={numberOfProduct}
            setNumberOfProduct={setNumberOfProduct}
            selectedTransport={selectedTransport}
            selectedItem={selectedItem}
          />
          <Prices
            numberOfProduct={numberOfProduct}
            selectedItem={selectedItem}
            selectedTransport={selectedTransport}
          />
        </Box>
        <Divider sx={{ my: 2, mx: 2 }} />
        <CartSelection
          selectedTransport={selectedTransport}
          selectedItem={selectedItem}
          selectedUnit={selectedUnit}
          numberOfProduct={numberOfProduct}
        />
      </Box>

    </Box>
  );
}

export function ShipmentTable({
  transportList,
  selectedTransport,
  onSelectTransport,
  selectedUnit,
  transportloading,
  selectedItem
}: {
  transportList: TransportList[] | null;
  selectedTransport: TransportItem | null;
  onSelectTransport: (transport: TransportItem) => void;
  selectedUnit: ItemResaultPrice | null;
  transportloading: boolean;
  selectedItem: ItemResaultPrice | null;
}) {
  const { toPersianPrice } = usePersianNumbers();
  const Costs = filterVehicleCosts(transportList, false, false);
  const groupedCosts = groupTransportByVehicleAndAlternate(Costs);
  const displayItems = Object.values(groupedCosts).sort((a, b) => {
    const getOrder = (item: (typeof groupedCosts)[string]) => {
      if (item.transit) return 1;
      if (item.alternate) return 2;
      return 0;
    };
    return getOrder(a) - getOrder(b);
  });

  return (
    <Box className="income-modal-table-container" sx={{ mb: 1 }}>
      <TableContainer sx={{ overflow: 'auto' }} className="income-modal-table">
        <Table size="small">
          <TableHead>
            <TableRow
              className="income-modal-table-header"
              sx={{ '& .MuiTableCell-root': { p: 0.8 } }}
            >
              <TableCell width={100}>شیوه تحویل</TableCell>
              <TableCell width={60}>ظرفیت</TableCell>
              <TableCell width={100}>
                <Box sx={{ ...flex.rowBetween }}>
                  هزینه کل
                  <RialIcon size={24} />
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {transportloading
                    ?
                    <CircularProgress size={24} />
                    :
                    'ارسال به این منطقه انجام نمی‌شود'
                  }
                </TableCell>
              </TableRow>
            ) : (
              displayItems.map((group) => {
                const isSelected =
                  selectedTransport &&
                  selectedTransport.vehicleId === group.vehicleId &&
                  Boolean(selectedTransport.alternate) === Boolean(group.alternate) &&
                  Boolean(selectedTransport.transit) === Boolean(group.transit);
                const sumPrice = (group.fare?.fullFare ?? 0) +
                  group.costs.reduce((sum, c) => sum + (c.priceVehiclesCost || 0), 0);
                const displayWeight = toPersianDigits(group.capacity * (selectedItem?.unitRatio || 1));
                const loadAndUnloadCosts = (group.fare?.loadingCost || 0) + (group.fare?.unloadingCost || 0);
                return (
                  <TableRow
                    key={`${group.vehicleId}-${Boolean(group.alternate)}-${Boolean(group.transit)}`}
                    onClick={() => onSelectTransport({ ...group.costs[0], ...group } as TransportItem)}
                    hover
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'action.selected' : 'inherit',
                      '& .MuiTableCell-root': { p: 0.8 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {group.vehicleTitle} {group.alternate && <span style={{ color: 'var(--icon-success)' }}>(نوبت دار)</span>} {group.transit && <span style={{ color: 'var(--text-warning)' }}>(ترانزیت)</span>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {displayWeight} {selectedItem?.valueTitle || ''}
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={
                          <Box component="div" sx={{ textAlign: 'left', dir: 'rtl', fontSize: '14px', p: 0.5 }}>
                            {/* Service Costs (e.g. loading, traffic plan) */}
                            {group.costs.map((c, i) => (
                              <>
                                <Box sx={{ ...flex.rowBetween }} key={`cost-${c.vehiclesCostId || i}`}>
                                  <Typography variant="body2">
                                    {c.vehiclesCostTitle}:
                                  </Typography>
                                  <Typography variant="body2">
                                    {toPersianPrice(c.priceVehiclesCost)} ریال
                                  </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ opacity: 0.4, my: 1, borderColor: 'background.paper' }} />
                              </>
                            ))}
                            {/* Base Freight */}
                            {group.fare?.fare > 0 && (
                              <>
                                <Box sx={{ ...flex.rowBetween }}>
                                  <Typography variant="body2">
                                    کرایه پایه:
                                  </Typography>
                                  <Typography variant="body2">
                                    {toPersianPrice(group.fare.fare)} ریال
                                  </Typography>
                                </Box>
                              </>
                            )}
                            {/* Commission */}
                            {group.fare?.comission > 0 && (
                              <>
                                <Divider variant="middle" sx={{ opacity: 0.4, my: 1, borderColor: 'background.paper' }} />
                                <Box sx={{ ...flex.rowBetween }}>
                                  <Typography variant="body2">
                                    کمیسیون:
                                  </Typography>
                                  <Typography variant="body2">
                                    {toPersianPrice(group.fare.comission)} ریال
                                  </Typography>
                                </Box>
                              </>
                            )}
                            {/* Delay Fee */}
                            {group.fare?.fareDelay > 0 && (
                              <>
                                <Divider variant="middle" sx={{ opacity: 0.4, my: 1, borderColor: 'background.paper' }} />
                                <Box sx={{ ...flex.rowBetween }}>
                                  <Typography variant="body2">
                                    هزینه تأخیر در بارگیری/تخلیه:
                                  </Typography>
                                  <Typography variant="body2">
                                    {toPersianPrice(group.fare.fareDelay)} ریال
                                  </Typography>
                                </Box>
                              </>
                            )}

                            {/* Road Type Coefficient */}
                            {group.fare?.coefficientRoadTypeFare > 0 && (
                              <>
                                <Divider variant="middle" sx={{ opacity: 0.4, my: 1, borderColor: 'background.paper' }} />
                                <Box sx={{ ...flex.rowBetween }}>
                                  <Typography variant="body2">
                                    ضریب ارتفاع جاده:
                                  </Typography>
                                  <Typography variant="body2">
                                    {toPersianPrice(group.fare.coefficientRoadTypeFare)} ریال
                                  </Typography>
                                </Box>
                              </>
                            )}
                            {group.fare?.costsCompany > 0 && (
                              <>
                                <Divider variant="middle" sx={{ opacity: 0.4, my: 1, borderColor: 'background.paper' }} />
                                <Box sx={{ ...flex.rowBetween }}>
                                  <Typography variant="body2">
                                    هزینه کارخانه:
                                  </Typography>
                                  <Typography variant="body2">
                                    {toPersianPrice(group.fare.costsCompany)} ریال
                                  </Typography>
                                </Box>
                              </>
                            )}
                            {group.fare?.loadingCost > 0 || group.fare?.unloadingCost > 0 && (
                              <>
                                <Divider variant="middle" sx={{ opacity: 0.4, my: 1, borderColor: 'background.paper' }} />
                                <Box sx={{ ...flex.rowBetween }}>
                                  <Typography variant="body2">
                                    هزینه بارگیری و تخلیه:
                                  </Typography>
                                  <Typography variant="body2">
                                    {toPersianPrice(loadAndUnloadCosts)} ریال
                                  </Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        }
                        placement="top"
                        arrow
                        disableInteractive
                      >
                        <Box sx={{ ...flex.rowBetween, alignItems: 'center' }}>
                          <Typography variant="body2">
                            {toPersianPrice(sumPrice)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function OrderOptions({
  inventory,
  transportList,
  selectedId,
  selectedAlternate,
  selectedTransit,
  geofence,
  selectedItem
}: {
  inventory: Inventory | null;
  transportList: TransportList[] | null;
  selectedId: number | null;
  selectedAlternate: boolean;
  selectedTransit: boolean;
  geofence: GeoFence | null;
  selectedItem: ItemResaultPrice | null;
}) {
  const { toPersianPrice } = usePersianNumbers();
  const typoStyles = { display: 'flex', alignItems: 'center', gap: '2px', };
  const detailBox =
  {
    display: 'flex',
    py: 1,
    px: 2,
    bgcolor: 'action.hover',
    borderRadius: '14px',
    ...gap.ten,
  };
  const selectedTransport = transportList?.flatMap(t => t.listItemVehicleShipp).filter(t =>
    t.vehicleId === selectedId &&
    Boolean(t.alternate) === Boolean(selectedAlternate) &&
    Boolean(t.transit) === Boolean(selectedTransit)
  ) || [];
  const [visibleInventory, setVisibleInventory] = useState(true);

  useEffect(() => {
    setVisibleInventory(!selectedTransport[0]?.transit);
  }, [selectedTransport]);

  const { selectedWarehouse } = useProductsStore();

  const alternateDays = selectedItem?.shippingTimeAlternate;
  const weekdayNames = useWeekdays(alternateDays);
  const formattedAlternateDays = useFormattedWeekdays(weekdayNames);

  const transitStartPreaper = selectedItem?.shippingStartTimeTransit;
  const transitPreparationTime = usePreparationTime({ start: transitStartPreaper });

  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);

  return (
    <Box sx={{ ...flex.column, gap: 1, py: 0.5 }}>
      <Box sx={{
        minHeight: '48px',
        position: 'relative',
        '& > div': {
          position: 'absolute',
          width: '100%'
        }
      }}>
        <Grow in={visibleInventory} timeout={300} mountOnEnter>
          <Box sx={{ ...detailBox, ...flex.rowAround }}>
            <Typography sx={typoStyles}>
              <Tooltip title={inventory?.inventoryStr} placement='top' arrow disableInteractive slots={{ transition: Zoom }}>
                <Inventory2RoundedIcon color='info' sx={{ fontSize: '22px', mr: 0.5 }} />
              </Tooltip>
              موجودی: {toPersianPrice(inventory?.fullInvestory ?? 0)}
            </Typography>
            <Tooltip title={selectedWarehouse?.virtualWarehouse && 'انبار وابسته'} placement='top' arrow disableInteractive slots={{ transition: Zoom }}>
              <Typography sx={typoStyles}>
                <LocationPinIcon color='info' sx={{ fontSize: '22px', mr: 0.5 }} />
                انبار: {selectedWarehouse?.title ?? '-'}
              </Typography>
            </Tooltip>
            <Typography sx={typoStyles}>
              <AccessTimeRoundedIcon color='info' sx={{ fontSize: '22px', mr: 0.5 }} />
              {selectedTransport[0]?.alternate ? formattedAlternateDays : 'آماده سازی ' + transitPreparationTime}
            </Typography>
          </Box>
        </Grow>

        <Grow in={!visibleInventory} timeout={300} mountOnEnter>
          <Box sx={{ ...detailBox, ...flex.rowAround }}>
            <Typography sx={typoStyles}>
              <LocationPinIcon color='info' sx={{ fontSize: '22px', mr: 0.5 }} />
              {selectedItem?.titleCompany}
            </Typography>
            <Typography sx={typoStyles}>
              <AccessTimeRoundedIcon color='info' sx={{ fontSize: '22px', mr: 0.5 }} />
              {transitPreparationTime}
            </Typography>
          </Box>
        </Grow>
      </Box>

      <Grow in={!isBranchDelivery} timeout={300} unmountOnExit>
        <Box
          sx={{
            ...flex.column, ...gap.ten, ...detailBox,
            '& .MuiTypography-root, span ': {
              whiteSpace: 'nowrap !important',
            }
          }}>
          {selectedTransport.map((item, index) => (
            <React.Fragment key={`option-${index}`}>
              {item.optionallyVehiclesCost && (
                <Box sx={{ ...flex.row, ...gap.ten }}>
                  <InfoRoundedIcon color='info' sx={{ fontSize: '20px' }} />
                  <Typography variant="body2">{item.vehiclesCostTitle} :</Typography>
                  <Typography variant="body2" sx={{ margin: '0 4px' }}>
                    {toPersianPrice(item.priceVehiclesCost)}
                  </Typography>
                  <RialIcon size={24} />
                </Box>
              )}
              {item.limitOfHoursVehiclesCost && (
                <Box sx={{ ...flex.row, ...gap.fifteen }}>
                  <Box sx={{ ...flex.row, ...gap.five }}>
                    <InfoRoundedIcon color='info' sx={{ fontSize: '20px' }} />
                    <Typography variant="body2">{item.vehiclesCostTitle} :</Typography>
                    <Typography variant="body2" sx={{ margin: '0 4px' }}>
                      {toPersianPrice(item.priceVehiclesCost)}
                    </Typography>
                    <RialIcon size={24} />
                  </Box>

                  <Box sx={{ ...flex.row, ...gap.five }}>
                    <AccessTimeRoundedIcon color='info' sx={{ fontSize: '20px' }} />
                    <Typography variant="body2">ارسال بین ساعات</Typography>
                    <Typography variant="body2" sx={{ margin: '0 2px' }}>
                      {item.limitOfHoursVehiclesCost ?? '??'} تا {item.limitToHoursVehiclesCost ?? '??'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Grow>
    </Box>
  );
}

function Prices({
  numberOfProduct,
  selectedItem,
  selectedTransport
}: {
  numberOfProduct: number;
  selectedItem: ItemResaultPrice | null;
  selectedTransport: TransportItem | null;
}) {
  const { toPersianPrice } = usePersianNumbers();
  const { resultPrice, price, disPrice } = usePriceCalculator(selectedItem, numberOfProduct, selectedTransport);
  const roundedResultPrice = useRoundedPrice(resultPrice);

  const priceBox =
  {
    ...flex.rowBetween,
    ...width.full,
    height: '48px',
    borderRadius: '12px',
    bgcolor: 'var(--background-overlay-light)',
    px: 2,
  };

  return (
    <Box className="Prices" sx={{ ...flex.column, ...width.half, gap: '24px' }}>
      <Box sx={priceBox}>
        <Box
          sx={{
            position: 'absolute',
            mb: 6,
            bgcolor: 'var(--background-overlay-light)',
            borderRadius: '8px',
            px: 1
          }}
        >
          <Typography variant="caption">
            قیمت واحد
          </Typography>
        </Box>
        {(selectedItem?.lowestNumberOfDiscount ?? 0) <= numberOfProduct
          ?
          <Box sx={{ ...flex.row, ...gap.fifteen }}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  color: 'text.primary',
                }}
              >
                {toPersianPrice(selectedItem?.priceWarehouse)}
              </Typography>
              <Box
                component="span"
                sx={{
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  right: '0',
                  height: '2px',
                  bgcolor: 'error.main',
                  transform: 'rotate(-10deg)',
                  transformOrigin: 'center',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            </Box>
            <Typography variant="body1" >
              {toPersianPrice(price)}
            </Typography>
          </Box>
          :
          <Typography variant="body1" >
            {toPersianPrice(price)}
          </Typography>
        }
        <RialIcon size={28} />
      </Box>
      <Box sx={priceBox}>
        <Box
          sx={{
            position: 'absolute',
            mb: 6,
            bgcolor: 'var(--background-overlay-light)',
            borderRadius: '8px',
            px: 1
          }}
        >
          <Typography variant="caption">
            قیمت تحویل
          </Typography>
        </Box>
        <Typography variant="body1" >
          {toPersianPrice(resultPrice)}
        </Typography>
        <RialIcon size={28} />
      </Box>
    </Box>
  )
}

interface OrderInputProps {
  maxInventory?: number;
  selectedUnit: ItemResaultPrice | null;
  onUnitChange: (e: SelectChangeEvent<string>) => void;  
  availableUnits: ItemResaultPrice[];
  numberOfProduct: number;
  setNumberOfProduct: (value: number) => void;
  selectedTransport: TransportItem | null;
  selectedItem: ItemResaultPrice | null;
}

const OrderInput: React.FC<OrderInputProps> = ({
  maxInventory,
  selectedUnit,
  onUnitChange,
  availableUnits,
  numberOfProduct,
  setNumberOfProduct,
  selectedTransport,
  selectedItem
}) => {
  const units = availableUnits;
  const hasMultipleUnits = availableUnits.length > 1;

  React.useEffect(() => {
    if (selectedTransport && selectedItem) {
      const numericWeight = selectedTransport.capacity * (selectedItem.unitRatio || 1);
      setNumberOfProduct(numericWeight); 
      console.log("🚀 ~ OrderConfirm ~ numericWeight:", numericWeight)
    }
  }, [selectedTransport, selectedItem]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '50%',
      }}
    >
      {/* Controlled NumberField component */}
      <NumberField
        label="تعداد"
        value={numberOfProduct} 
        onChange={setNumberOfProduct} 
        decimal={true}
        step={1}
        min={0}
        max={maxInventory} 
      />

      {/* Unit selection dropdown */}
      <FormControl size="small" sx={{ minWidth: '200px', flex: 1 }}>
        <Select
          value={selectedUnit?.valueTitle || ''}
          onChange={onUnitChange}
          input={
            <OutlinedInput
              label={hasMultipleUnits ? 'واحد' : 'واحد'}
              sx={{
                '& .MuiOutlinedInput-notchedOutline span': {
                  opacity: 1,
                  position: 'absolute',
                  top: '-4px',
                  left: '6px',
                  backgroundColor: 'var(--background-paper)',
                  px: 0.5,
                },
              }}
            />
          }
        >
          {units.map((unitItem) => (
            <MenuItem key={unitItem.valueId} value={unitItem.valueTitle}>
              {unitItem.valueTitle}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

interface CartSelectionProps {
  selectedTransport: TransportItem | null;
  selectedItem: ItemResaultPrice | null;
  selectedUnit: ItemResaultPrice | null;
  numberOfProduct: number;
}

function CartSelection({ selectedTransport, selectedItem, selectedUnit, numberOfProduct }: CartSelectionProps) {
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [groupedItems, setGroupedItems] = useState<Record<string, ListCart[]>>({});
  const [selectedCartId, setSelectedCartId] = useState<number>(0);

  const buttonState = !selectedTransport;
  const { selectedAccount } = useAccountStore();
  const { selectedProject } = useProjectStore();
  const { showSnackbar } = useSnackbar();
  const { toPersianPrice } = usePersianNumbers();


  const fetchListCarts = async () => {
    setLoading(true);
    try {
      const data: ListCart[] = await getCartList();
      console.log("👨‍💻 ~ fetchListCarts ~ data:", data)
      const grouped = data.reduce((acc, item) => {
        const key = item.name || 'بدون نام';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, ListCart[]>);

      setGroupedItems(grouped);
    } catch (error) {
      console.error('Error fetching cart list:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchListCarts();
  }, []);

  const handleCartChange = (cartId: number) => {
    const value = cartId;

    if (value === 0) {
      setCart(null);
      setSelectedCartId(value);
      return;
    }

    const allItems = Object.values(groupedItems).flat();
    const foundCart = allItems.find(item => item.id === value);

    if (foundCart) {
      setCart(foundCart);
      setSelectedCartId(value);
      showSnackbar('سبد جدید انتخاب شد', 'error');
    } else {
      console.warn(`Cart with id ${value} not found`);
    }
  };

  const createCart = async () => {
    try {
      const response = await addCart(selectedItem, selectedAccount, selectedProject, false, '0');
      console.log("🐱‍👤 ~ createCart ~ response.id:", response.id);
      showSnackbar('سبد جدید ایجاد شد', 'success');
      return response.id;
    } catch (error) {
      showSnackbar('خطا در ایجاد سبد جدید', 'error');
      return;
    }
  };

  const addItemCart = async (cartId: number) => {
    try {
      const response = await
        addItemToCart(
          cartId,
          selectedItem?.priceId,
          numberOfProduct,
          selectedUnit?.valueId
        );
      console.log("🐱 ~ createCart ~ response.id:", response);
      showSnackbar('آیتم به سبد اضافه شد', 'success');
      return response.id;
    } catch (error) {
      showSnackbar('خطا در اضافه کردن آیتم', 'error');
      return;
    }
  };

  const submitCart = async () => {
    if (!selectedItem || !selectedAccount || !selectedProject) return;
    if (selectedCartId === 0) {
      createCart().then(async (id) => {
        if (id) {
          await fetchListCarts();
          handleCartChange(id);
          await addItemCart(id);
        }
      });
    } else {
      await addItemCart(selectedCartId);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: '200px', flex: 1 }}>
        <Select
          displayEmpty
          value={selectedCartId}
          input={<OutlinedInput />}
          renderValue={(selected) => {
            if (Number(selected) === 0) return 'سبد جدید';
            const found = Object.values(groupedItems)
              .flat()
              .find(item => item.id === Number(selected));
            const accountTitle = found?.codeAccCustomerTitle || 'نامشخص';
            const projectTitle = found?.projectIdCustomerTitle
              ? found?.branchCenterDelivery
                ? 'تحویل درب انبار'
                : `پروژه ${found?.projectIdCustomerTitle}`
              : found?.branchCenterDelivery
                ? 'تحویل درب انبار'
                : 'بدون پروژه';
            return found ? `${found.id} - ${accountTitle} - ${projectTitle}` : 'سبد انتخاب شده';
          }}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 400 },
            },
          }}
        >
          <MenuItem value={0} onClick={() => handleCartChange(0)}>
            <em>سبد جدید</em>
          </MenuItem>

          {loading ? (
            <MenuItem disabled>در حال بارگذاری...</MenuItem>
          ) : Object.keys(groupedItems).length === 0 ? (
            <MenuItem disabled>هیچ سبدی موجود نیست</MenuItem>
          ) : (
            Object.entries(groupedItems).map(([name, items]) => (
              <div key={name}>
                <MenuItem disabled sx={{ fontWeight: 600, color: "text.primary", py: 1 }}>
                  {name} ({items.length})
                </MenuItem>
                {items.map((item) => {
                  const accountTitle = item.codeAccCustomerTitle || 'نامشخص';
                  const projectTitle = item.projectIdCustomerTitle
                    ? item.branchCenterDelivery
                      ? 'تحویل درب انبار'
                      : `پروژه ${item.projectIdCustomerTitle}`
                    : item.branchCenterDelivery
                      ? 'تحویل درب انبار'
                      : 'بدون پروژه';

                  return (
                    <MenuItem key={item.id} value={item.id} sx={{ pl: 4, }} onClick={() => handleCartChange(item.id)}>
                      <Typography variant="body2" color="textPrimary" className='nowarp'>
                        {toPersianPrice(item.id)} - {accountTitle} - {projectTitle}
                      </Typography>
                    </MenuItem>
                  );
                })}

              </div>
            ))
          )}
        </Select>
      </FormControl>

      <div style={{ display: 'flex', gap: '10px', flexDirection: 'row' }}>
        <Btn disabled color='info' variant="contained" sx={{ whiteSpace: 'nowrap' }}>
          افزودن به سفارش
        </Btn>
        <BtnGroup variant="contained" color='success'>
          <Btn
            onClick={submitCart}
            disabled={buttonState}
            color='success'
            variant="contained"
            sx={{ width: '70px' }}
          >
            ثبت
          </Btn>
          <Btn disabled={buttonState} color='success' variant="contained" sx={{ whiteSpace: 'nowrap' }}>
            رفتن به سبد خرید
          </Btn>
        </BtnGroup>
      </div>
    </Box>
  );
}
