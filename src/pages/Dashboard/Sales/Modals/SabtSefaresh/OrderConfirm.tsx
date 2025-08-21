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
  Divider
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
import { flex, width } from '@/models/ReadyStyles';
import { getInventory, getGeoFence, getTransportListSale } from '@/api';
import { Inventory, GeoFence, TransportList, TransportTableProps, ItemResaultPrice } from '@/models';
import { useProductsStore, useProjectStore, useBranchDeliveryStore, useDistanceStore } from '@/stores';
import { toPersianDigits } from '@/utils/persianNumbers'
import { useSnackbar } from "@/contexts/SnackBarContext";
import { filterVehicleCosts, groupTransportByVehicleAndAlternate } from '@/hooks/filterVehicleCosts';

interface ShipmentTableProps {
  transportList: TransportList[] | null;
  selectedTransport: TransportList | null;
  onSelectTransport: (transport: TransportList) => void;
  selectedUnit: string;
  unitRatio: number;
}

export function SabtSfaresh() {
  const { toPersianPrice } = usePersianNumbers();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [geofence, setgeofence] = useState<GeoFence | null>(null);
  const [transportListSale, setTransportListSale] = useState<TransportList[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<TransportList | null>(null);
  const selectedId = selectedTransport?.ididentityShipp || null;

  const { products } = useProductsStore();

  const selectedPeriod = React.useMemo(() => {
    const item = localStorage.getItem('periodData');
    return item ? JSON.parse(item) : {};
  }, []);

  const { selectedProject } = useProjectStore();
  const isBranchDelivery = useBranchDeliveryStore((s) => s.isBranchDelivery);

  // Unit selection state
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [unitRatio, setUnitRatio] = useState<number>(1);

  // On product selection, initialize unit
  const { selectedItem, getAvailableUnits } = useProductsStore();
  const availableUnits = selectedItem ? getAvailableUnits(selectedItem.priceId) : [];
  const { distance } = useDistanceStore();
  const { showSnackbar } = useSnackbar();

  const primaryDistance = useMemo(
    () => distance.find((d) => d.warehouseId > 0)?.warehouseId,
    [distance]
  );

  React.useEffect(() => {
    if (selectedItem && !selectedUnit && availableUnits.length > 0) {
      const firstUnit = availableUnits[0];
      setSelectedUnit(firstUnit.valueTitle);
      setUnitRatio(firstUnit.unitRatio || 1);
    }
  }, [selectedItem, availableUnits, selectedUnit]);

  const handleUnitChange = (e: SelectChangeEvent<string>) => {
    const title = e.target.value;
    setSelectedUnit(title);
    const unit = availableUnits.find(u => u.valueTitle === title);
    if (unit) {
      setUnitRatio(unit.unitRatio || 1);
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

    setLoading(true);
    getTransportListSale(transportListPrice, geofence, distance, isBranchDelivery, primaryDistance)
      .then(data => {
        const list = Array.isArray(data) ? data : [data];
        setTransportListSale(list);
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
      .finally(() => setLoading(false));
  }, [products, geofence, isBranchDelivery, selectedItem?.priceId, distance, primaryDistance]);

  return (
    <Box sx={{ width: '100%', flex: '1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'end' }}>
      <Box sx={{ height: '100%' }}>
        <ShipmentTable
          transportList={transportListSale}
          selectedTransport={selectedTransport}
          onSelectTransport={setSelectedTransport}
          selectedUnit={selectedUnit}
          unitRatio={unitRatio}
        />
      </Box>

      <OrderOptions
        inventory={inventory}
        transportList={transportListSale}
        selectedId={selectedTransport?.ididentityShipp || null}
        geofence={geofence}
        selectedItem={selectedItem}
      />

      <OrderInput
        maxInventory={inventory?.fullInvestory ?? undefined}
        selectedUnit={selectedUnit}
        onUnitChange={handleUnitChange}
        availableUnits={availableUnits}
      />

      {/* Prices Box */}
      <Box className="Prices" sx={{ /* ... */ }}>
        {/* ... unchanged */}
      </Box>
    </Box>
  );
}

export function ShipmentTable({
  transportList,
  selectedTransport,
  onSelectTransport,
  selectedUnit,
  unitRatio,
}: ShipmentTableProps) {
  const { toPersianPrice } = usePersianNumbers();
  const Costs = filterVehicleCosts(transportList, true, false);
  const groupedCosts = groupTransportByVehicleAndAlternate(Costs);
  const displayItems = Object.values(groupedCosts).sort((a, b) => {
    const getOrder = (item: (typeof groupedCosts)[string]) => {
      if (item.transit) return 1;
      if (item.alternate) return 2;
      return 0;
    };
    return getOrder(a) - getOrder(b);
  });
  console.log("🚀 ~ ShipmentTable ~ displayItems:", displayItems)

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
              <TableCell width={100}>هزینه کل</TableCell> {/* Changed label */}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  ارسال به این منطقه انجام نمی‌شود
                </TableCell>
              </TableRow>
            ) : (
              displayItems.map((group) => {
                const isSelected = selectedTransport?.ididentityShipp === group.ididentityShipp;
                const sumPrice = (group.fare?.fullFare ?? 0) +
                  group.costs.reduce((sum, c) => sum + (c.priceVehiclesCost || 0), 0);
                const displayWeight = toPersianDigits(group.capacity);
                return (
                  <TableRow
                    key={`${group.vehicleId}-${Boolean(group.alternate)}-${Boolean(group.transit)}`}
                    onClick={() => onSelectTransport({ ...group.costs[0], ...group } as TransportList)}
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
                      {displayWeight} {selectedUnit}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ ...flex.rowBetween, alignItems: 'center' }}>
                        <Typography variant="body2">
                          {toPersianPrice(sumPrice)}
                        </Typography>

                        {/* Tooltip: Show all cost details */}
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
                                </>
                              ))}
                              {/* Base Freight */}
                              {group.fare?.fare > 0 && (
                                <>
                                  <Divider variant="middle" sx={{ opacity: 0.4, my: 1, borderColor: 'background.paper' }} />
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
                            </Box>
                          }
                          placement="right"
                          arrow
                          disableInteractive
                        >
                          <IconButton color="info" size="small">
                            <InfoRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
  geofence,
  selectedItem
}: {
  inventory: Inventory | null;
  transportList: TransportList[] | null;
  selectedId: number | null; 
  geofence: GeoFence | null;
  selectedItem: ItemResaultPrice | null;
}) {
  const { toPersianPrice } = usePersianNumbers();
  const typoStyles = { display: 'flex', alignItems: 'center', gap: '2px',  };
  const detailBox =
  {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    gap: 3,
    py: 1,
    px: 2,
    bgcolor: 'action.hover',
    borderRadius: '60px',
    borderLeft: '3px solid var(--icon-success)',
    boxShadow: '-6px 0 4px -4px var(--icon-success)',
    transition: 'all 0.2s ease',
    '&:hover': {
      scale: '1.02',
      transform: 'translateY(-5px)'
    }
  };
  const selectedTransport = transportList?.find(t => t.ididentityShipp === selectedId);
  const [visibleInventory, setVisibleInventory] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleInventory(!selectedTransport?.transit);
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedTransport]);

  const optionalCosts = selectedTransport
    ? filterVehicleCosts([selectedTransport], false, true)
    : [];

  const Costs = selectedTransport
    ? filterVehicleCosts([selectedTransport], true, false)
    : [];
  console.log("🎂 ~ OrderOptions ~ Costs:", Costs)
  const { selectedWarehouse } = useProductsStore();

  const alternateDays = selectedItem?.shippingTimeAlternate;
  const weekdayNames = useWeekdays(alternateDays);
  const formattedAlternateDays = useFormattedWeekdays(weekdayNames);

  const transitStartPreaper = selectedItem?.shippingStartTimeTransit;
  const transitPreparationTime = usePreparationTime({ start: transitStartPreaper });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 1, py: 0.5 }}>

      {/* <Grow in easing={{ enter: 'ease-in', exit: 'ease-out' }}> */}
      <div>
        {optionalCosts.map((item, index) => (
          <Box key={`optionalCosts-${index}`} sx={detailBox} >
            <InfoRoundedIcon color='info' />
            <Typography>
              {item.vehiclesCostTitle} :
            </Typography>
            <Typography sx={{ margin: '0 4px' }}>
              {toPersianPrice(item.priceVehiclesCost)}
            </Typography>
            {item.optionallyVehiclesCost && (
              <span style={{ color: 'var(--text-warning)', fontWeight: 500 }}>
                به اختیار کاربر
              </span>
            )}
          </Box>
        ))}
        {Costs.map((item, index) => (
          <Box key={`Costs-${index}`} sx={detailBox} >
            <InfoRoundedIcon color='info' />
            <Typography>
              {item.vehiclesCostTitle} :
            </Typography>
            <Typography sx={{ margin: '0 4px' }}>
              {toPersianPrice(item.priceVehiclesCost)}
            </Typography>
            {item.optionallyVehiclesCost && (
              <span style={{ color: 'var(--text-warning)', fontWeight: 500 }}>
                به اختیار کاربر
              </span>
            )}
            <InfoRoundedIcon color='info' />
            <span style={{ color: 'green', fontWeight: 500 }}>
              ارسال بین ساعات
            </span>
            <span style={{ color: '#000', fontWeight: 500, margin: '0 2px' }}>
              {geofence?.limitOfHours ?? '??'} تا {geofence?.limitToHours ?? '??'}
            </span>
          </Box>
        ))}
      </div>
      {/* </Grow> */}

      {visibleInventory
        ?
        // <Grow in={!selectedTransport?.transit} easing={{ enter: 'ease-in', exit: 'ease-out' }}>
        <Box sx={detailBox}>
          <Typography sx={typoStyles}>
            <Tooltip title={inventory?.inventoryStr} placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
              <Inventory2RoundedIcon color='info' sx={{ fontSize: '22px' }} />
            </Tooltip>
            موجودی: {inventory?.fullInvestory != null
              ? toPersianPrice(inventory.fullInvestory)
              : '-'
            }
          </Typography>
          <Tooltip title={selectedWarehouse?.virtualWarehouse && 'انبار وابسته'} placement='top' arrow disableInteractive slots={{ transition: Zoom }} >
            <Typography sx={typoStyles}>
              <LocationPinIcon color='info' sx={{ fontSize: '22px' }} />
              انبار: {selectedWarehouse?.title != null
                ? selectedWarehouse.title
                : '-'
              }
            </Typography>
          </Tooltip>
          <Typography sx={typoStyles}>
            <AccessTimeRoundedIcon color='info' sx={{ fontSize: '22px' }} />
            {selectedTransport?.alternate ? formattedAlternateDays : 'آماده سازی ' + transitPreparationTime}
          </Typography>
        </Box>
        // {/* </Grow> */}
        :
        // {/*  <Grow in={!selectedTransport?.alternate} easing={{ enter: 'ease-in', exit: 'ease-out' }}> */}
        <Box sx={detailBox} >
          <Typography sx={typoStyles}>
            <LocationPinIcon color='info' sx={{ fontSize: '22px' }} />
            {selectedItem?.titleCompany}
          </Typography>
          <Typography sx={typoStyles}>
            <LocationPinIcon color='info' sx={{ fontSize: '22px' }} />
            {transitPreparationTime}
          </Typography>
        </Box>
        // {/* </Grow> */}
      }
    </Box>
  );
}

function OrderInput({
  maxInventory,
  selectedUnit,
  onUnitChange,
  availableUnits
}: {
  maxInventory?: number;
  selectedUnit: string;
  onUnitChange: (e: SelectChangeEvent<string>) => void;
  availableUnits: any[];
}) {
  const [productNumber, setProductNumber] = React.useState('0');
  const { selectedItem } = useProductsStore();

  const units = availableUnits;
  const hasMultipleUnits = availableUnits.length > 1;

  return (
    <Box sx={{ py: 1, px: 2, mb: 1 }}>
      <Typography> تعداد و واحد کالا </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '24px',
          width: '100%',
          mt: 1
        }}
      >
        <NumberField
          label="تعداد"
          value={productNumber}
          onChange={setProductNumber}
          decimal={true}
          step={1}
          min={0}
          max={maxInventory}
        />

        <FormControl size='small' sx={{ minWidth: '200px', flex: 1 }}>
          <Select
            value={selectedUnit}
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
    </Box>
  );
}