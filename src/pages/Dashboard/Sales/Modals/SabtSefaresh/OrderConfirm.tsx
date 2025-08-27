import React, { useState, useMemo, useEffect } from 'react';

import {
  Typography,
  Modal,
  Box,
  IconButton,
  Tabs, Tab,
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
  Slide, Backdrop,
  Zoom, Grow,
  Divider,
  CircularProgress
} from '@mui/material';

import NumberField from '@/components/elements/NumberField';

import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import { TomanIcon, RialIcon } from '@/components/elements/TomanIcon';

import usePersianNumbers from '@/hooks/usePersianNumbers';
import { useWeekdays, useFormattedWeekdays, usePreparationTime } from '@/hooks/weekDayConverter';
import { flex, width, gap, height } from '@/models/ReadyStyles';
import { getInventory, getGeoFence, getTransportListSale } from '@/api';
// Added TransportItem import to handle individual transport items from new nested structure
import { Inventory, GeoFence, TransportList, TransportTableProps, ItemResaultPrice, TransportItem } from '@/models';
import { useProductsStore, useProjectStore, useBranchDeliveryStore, useDistanceStore, useAccountStore } from '@/stores';
import { toPersianDigits } from '@/utils/persianNumbers'
import { useSnackbar } from "@/contexts/SnackBarContext";
import { filterVehicleCosts, groupTransportByVehicleAndAlternate } from '@/hooks/filterVehicleCosts';
import { usePriceCalculator, useRoundedPrice } from '@/hooks/usePriceCalculator';

export function OrderConfirm() {
  const { toPersianPrice } = usePersianNumbers();
  const [loading, setLoading] = useState(true);
  const [numberOfProduct, setNumberOfProduct] = React.useState(0);
  const [transportloading, setTransportLoading] = useState(true);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [geofence, setgeofence] = useState<GeoFence | null>(null);
  const [transportListSale, setTransportListSale] = useState<TransportList[]>([]);
  // Changed from TransportList to TransportItem to match new nested structure
  const [selectedTransport, setSelectedTransport] = useState<TransportItem | null>(null);

  const { products, selectedItem, getAvailableUnits, setSelectedItem } = useProductsStore();

  const selectedPeriod = React.useMemo(() => {
    const item = localStorage.getItem('periodData');
    return item ? JSON.parse(item) : {};
  }, []);

  const { selectedProject } = useProjectStore();
  const { selectedAccount } = useAccountStore();
  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);

  // Unit selection state
  const [selectedUnit, setSelectedUnit] = useState<ItemResaultPrice | null>(null);
  const availableUnits = selectedItem ? getAvailableUnits(selectedItem.priceId) : [];
  const { distance, setDistance } = useDistanceStore();
  const { showSnackbar } = useSnackbar();

  const primaryDistance = useMemo(
    () => distance.find((d) => d.warehouseId > 0)?.warehouseId,
    [distance]
  );

  React.useEffect(() => {
    if (selectedItem && !selectedUnit && availableUnits.length > 0) {
      const baseUnit = availableUnits.find(unit => unit.valueId === selectedItem.valueIdBase) || availableUnits[0];
      setSelectedUnit(baseUnit);
    }
  }, [selectedItem, availableUnits, selectedUnit]);

  React.useEffect(() => {
    if (selectedTransport && selectedUnit) {
      const displayWeight = selectedTransport.capacity * (selectedUnit.unitRatio || 1);
      setNumberOfProduct(displayWeight);
    }
  }, [selectedTransport, selectedUnit]);


  const handleUnitChange = (e: SelectChangeEvent<string>) => {
    const title = e.target.value;
    const unit = availableUnits.find(u => u.valueTitle === title);
    if (unit) {
      setSelectedUnit(unit);
      setSelectedItem(unit);
    }
  };

  // Fetch inventory
  React.useEffect(() => {
    const firstProduct = Array.isArray(products) ? products[0] : products;
    if (!firstProduct) return;

    setLoading(true);
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
      .finally(() => setLoading(false));
  }, [products, selectedPeriod]);

  // Fetch geofence
  React.useEffect(() => {
    if (!selectedProject) return;

    setLoading(true);
    getGeoFence(selectedProject)
      .then(setgeofence)
      .catch((error) => {
        let errorMessage = 'خطا در دریافت محدوده جغرافیایی';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      })
      .finally(() => setLoading(false));
  }, [selectedProject]);

  React.useEffect(() => {
    const priceIdSale = selectedItem?.priceId;

    if (!priceIdSale || !geofence || !products.length) return;

    const transportListPrice = products.filter((p) => p.priceId === priceIdSale);
    if (transportListPrice.length === 0) return;

    setTransportLoading(true);
    getTransportListSale(transportListPrice, geofence, distance, isBranchDelivery, primaryDistance, selectedAccount, selectedProject)
      .then(data => {
        const list = Array.isArray(data) ? data : [data];
        setTransportListSale(list);
        // console.log("✔ ~ OrderConfirm ~ list:", list)

        // Update distance store with listDistance from transport API response
        if (list.length > 0 && list[0].listDistance) {
          setDistance(list[0].listDistance);
        }

        // Auto-select the first transport item
        const Costs = filterVehicleCosts(list, false, false);
        const groupedCosts = groupTransportByVehicleAndAlternate(Costs);
        const displayItems = Object.values(groupedCosts).sort((a, b) => {
          const getOrder = (item: (typeof groupedCosts)[string]) => {
            if (item.transit) return 1;
            if (item.alternate) return 2;
            return 0;
          };
          return getOrder(a) - getOrder(b);
        });

        if (displayItems.length > 0) {
          const firstItem = displayItems[0];
          setSelectedTransport({ ...firstItem.costs[0], ...firstItem } as TransportItem);
        }
      })
      .catch((error) => {
        let errorMessage = 'خطا در دریافت لیست حمل و نقل';
        if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error', 5000, <ErrorOutlineRoundedIcon />);
      })
      // Fixed: Use setTransportLoading instead of setLoading for transport-specific loading state
      .finally(() => setTransportLoading(false));
  }, [products, geofence, isBranchDelivery, selectedItem?.priceId, primaryDistance]);

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

      <Box sx={{ ...flex.rowBetween, ...width.full, ...gap.ten, mb: 2 }}>
        <OrderInput
          maxInventory={inventory?.fullInvestory ?? undefined}
          selectedUnit={selectedUnit}
          onUnitChange={handleUnitChange}
          availableUnits={availableUnits}
          numberOfProduct={numberOfProduct}
          setNumberOfProduct={setNumberOfProduct}
        />
        <Prices
          numberOfProduct={numberOfProduct}
          selectedItem={selectedItem}
          selectedTransport={selectedTransport}
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
  // console.log("🦈 ~ ShipmentTable ~ Costs:", transportList)
  const groupedCosts = groupTransportByVehicleAndAlternate(Costs);
  const displayItems = Object.values(groupedCosts).sort((a, b) => {
    const getOrder = (item: (typeof groupedCosts)[string]) => {
      if (item.transit) return 1;
      if (item.alternate) return 2;
      return 0;
    };
    return getOrder(a) - getOrder(b);
  });
  // console.log("😅 ~ ShipmentTable ~ displayItems:", displayItems)

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
                    // Updated to cast combined object as TransportItem instead of TransportList
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
  // Updated to handle new nested structure: flatten listItemVehicleShipp arrays before filtering
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

        {/* Transit Box */}
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

      <Grow in={selectedTransport.length > 0} timeout={300} unmountOnExit>
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
  console.log("🚀 ~ Prices ~ selectedTransport:", selectedTransport)
  console.log("🍒 ~ Prices ~ selectedItem:", selectedItem)
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

function OrderInput({
  maxInventory,
  selectedUnit,
  onUnitChange,
  availableUnits,
  numberOfProduct,
  setNumberOfProduct
}: {
  maxInventory?: number;
  selectedUnit: ItemResaultPrice | null;
  onUnitChange: (e: SelectChangeEvent<string>) => void;
  availableUnits: ItemResaultPrice[];
  numberOfProduct: number;
  setNumberOfProduct: (value: number) => void;
}) {
  const { selectedItem } = useProductsStore();

  const units = availableUnits;
  const hasMultipleUnits = availableUnits.length > 1;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '50%',
      }}
    >
      <NumberField
        label="تعداد"
        value={numberOfProduct}
        onChange={setNumberOfProduct}
        decimal={true}
        step={1}
        min={0}
        max={maxInventory}
      />

      <FormControl size='small' sx={{ minWidth: '200px', flex: 1 }}>
        <Select
          value={selectedUnit?.valueTitle || ''}
          onChange={onUnitChange}
          input={
            <OutlinedInput
              label={units.length > 1 ? <span style={{ color: 'var(--icon-main)' }}><ScaleRoundedIcon sx={{ fontSize: 'small', p: 0 }} /> واحد</span> : 'واحد'}
              sx={{
                '& .MuiOutlinedInput-notchedOutline span': {
                  opacity: 1,
                  position: 'absolute',
                  top: '-4px',
                  left: '6px',
                  backgroundColor: 'var(--background-paper)',
                  px: 0.5
                }
              }}
            />
          }
        >
          {units.map((unitItem) => (
            <MenuItem
              key={unitItem.valueId}
              value={unitItem.valueTitle}
            >
              {unitItem.valueTitle}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}