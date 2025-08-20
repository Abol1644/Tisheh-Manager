import React, { useState, useMemo } from 'react';

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
  Zoom, Grow
} from '@mui/material';

import NumberField from '@/components/elements/NumberField';

import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import { TomanIcon, RialIcon } from '@/components/elements/TomanIcon';

import usePersianNumbers from '@/hooks/usePersianNumbers';
import { flex } from '@/models/ReadyStyles';
import { getInventory, getGeoFence, getTransportListSale } from '@/api';
import { Inventory, GeoFence, TransportList, TransportTableProps } from '@/models';
import { useProductsStore, useProjectStore, useBranchDeliveryStore, useDistanceStore } from '@/stores';
import { toPersianDigits } from '@/utils/persianNumbers'
import { useSnackbar } from "@/contexts/SnackBarContext";
import filterVehicleCosts from '@/hooks/filterVehicleCosts';

interface SabtSfareshTableProps {
  transportList: TransportList[] | null;
  selectedTransport: TransportList | null;
  onSelectTransport: (transport: TransportList) => void;
  selectedUnit: string;
  unitRatio: number;
}

interface OrderOptionsProps {
  transportList: TransportList[] | null;
  options?: Array<{
    name: string;
    price: string;
    info?: string;
  }>;
  inventory: Inventory | null;
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
    const transportListPrice = products.filter((p) => p.priceId === priceIdSale);
    if (!transportListPrice || !geofence) return;

    setLoading(true);
    getTransportListSale(transportListPrice, geofence, distance, isBranchDelivery, primaryDistance)
      .then(data => {
        const list = Array.isArray(data) ? data : [data];
        setTransportListSale(list);

        // ✅ Auto-select first row ONLY if no selection exists
        // if (!selectedTransport && list.length > 0) {
        //   setSelectedTransport(list[0]);
        // }
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
  }, [products, geofence, isBranchDelivery, selectedItem?.priceId, selectedTransport]);

  return (
    <Box sx={{ width: '100%', flex: '1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'end' }}>
      <Box sx={{ height: '100%' }}>
        <SabtSfareshTable
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

export function SabtSfareshTable({
  transportList,
  selectedTransport,
  onSelectTransport,
  selectedUnit,
  unitRatio,
}: SabtSfareshTableProps) {
  const { toPersianPrice } = usePersianNumbers();
  const Costs = filterVehicleCosts(transportList, true, false, false);


  // ✅ Move getPriceInfoString outside render loop
  const getPriceInfoString = (row: any) => {
    const formatNumber = (num: any) => {
      return new Intl.NumberFormat('fa-IR').format(num);
    };

    const lines = [];

    // 1. Vehicle Cost
    if (row.priceVehiclesCost > 0) {
      lines.push(`${row.vehiclesCostTitle.trim()} ${formatNumber(row.priceVehiclesCost)} ریال`);
    }

    // 2. Commission
    if (row.fare?.comission > 0) {
      lines.push(`کمیسیون ${formatNumber(row.fare.comission)} ریال`);
    }

    // 3. Fare (کرایه حمل)
    if (row.fare?.fare > 0) {
      lines.push(`کرایه حمل ${formatNumber(row.fare.fare)} ریال`);
    }

    // 4. CoefficientRoadTypeFare
    if (row.fare?.coefficientRoadTypeFare > 0) {
      lines.push(`ضریب ارتفاع جاده ${formatNumber(row.fare.coefficientRoadTypeFare)} ریال`);
    }

    // 5. FareDelay
    if (row.fare?.fareDelay > 0) {
      lines.push(`هزینه تاخیر در بارگیری/تخلیه ${formatNumber(row.fare.fareDelay)} ریال`);
    }

    return lines.length > 0 ? lines.join('\n') : 'اطلاعاتی موجود نیست';
  };

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
            {Costs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  هیچ وسیله‌ای یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              Costs?.map((row) => {
                const isSelected = selectedTransport?.vehiclesCostId === row.vehiclesCostId;

                // ✅ Calculate sumPrice: fullFare (from fare) + priceVehiclesCost
                const fullFare = row.fare?.fullFare ?? 0;
                const vehicleCost = row.priceVehiclesCost ?? 0;
                const sumPrice = fullFare + vehicleCost;

                const displayWeight = toPersianDigits((row.capacity));

                const priceInfo = getPriceInfoString(row);

                return (
                  <TableRow
                    key={`${row.vehicleId}-${row.ididentityShipp}`}
                    onClick={() => onSelectTransport(row)}
                    hover
                    className="income-modal-table-rows"
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'action.selected' : 'inherit',
                      '& .MuiTableCell-root': { p: 0.8 },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ ...flex.columnStart }}>
                        <Typography variant="body2" fontWeight="bold">
                          {row.vehicleTitle}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{displayWeight} {selectedUnit}</TableCell>
                    <TableCell>
                      <Box sx={{ ...flex.rowBetween, alignItems: 'center' }}>
                        <Box sx={{ ...flex.columnStart }}>
                          {/* ✅ Display sumPrice instead of just vehicle cost */}
                          <Typography variant="body2">
                            {toPersianPrice(sumPrice)}
                          </Typography>
                        </Box>

                        {/* Tooltip still shows detailed breakdown */}
                        {priceInfo && (
                          <Tooltip
                            title={priceInfo}
                            placement="right"
                            arrow
                            disableInteractive
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '14px',
                                  direction: 'rtl',
                                  whiteSpace: 'pre-line',
                                  textAlign: 'right',
                                },
                              },
                            }}
                          >
                            <IconButton color="info" size="small">
                              <InfoRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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
  selectedId
}: {
  inventory: Inventory | null;
  transportList: TransportList[] | null;
  selectedId: number | null;  // ididentityShipp
}) {
  const { toPersianPrice } = usePersianNumbers();
  const typoStyles = { display: 'flex', alignItems: 'center', gap: '2px', mb: 1 };

  // ✅ Find the selected row from transportList by ididentityShipp
  const selectedTransport = transportList?.find(t => t.ididentityShipp === selectedId);
  

  // ✅ Filter optional/conditional costs from this single row
  const optionalCosts = selectedTransport
    ? filterVehicleCosts([selectedTransport], false, true, true)
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 1, py: 0.5 }}>

      {/* Render optional/conditional costs for selected row */}
      {optionalCosts.length > 0 && selectedTransport && optionalCosts.map((item, index) => (
        <Grow in key={index}>
          <Box
            // key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '4px',
              fontSize: '0.95rem',
              color: '#000',
              fontWeight: 500,
              bgcolor: 'action.hover',
              py: 1,
              px: 2,
              borderRadius: '60px',
            }}
          >
            <InfoRoundedIcon color='info' />
            <span style={{ fontSize: '110%', color: '#000', fontWeight: 500 }}>
              {item.vehiclesCostTitle} :
            </span>
            <span style={{ fontSize: '110%', color: '#000', fontWeight: 500, margin: '0 4px' }}>
              {toPersianPrice(item.priceVehiclesCost)}
            </span>
            {item.optionallyVehiclesCost && (
              <span style={{ fontSize: '110%', color: 'darkred', fontWeight: 500 }}>
                به اختیار کاربر
              </span>
            )}
            {/* Clock Limit (commented for now) */}
          
            {/* {item.clockLimitVehiclesCost && (
              <>
                <span style={{ fontSize: '110%', color: 'green', fontWeight: 500 }}>
                  در صورت ارسال بین ساعات
                </span>
                <span style={{ fontSize: '110%', color: '#000', fontWeight: 500, margin: '0 2px' }}>
                  {item.limitOfHours ?? '??'} تا {item.limitToHours ?? '??'}
                </span>
              </>
            )} */}
          
          </Box>
        </Grow>
      ))}

      {/* Inventory Info */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          gap: 1,
          py: 1,
        }}
      >
        <Typography sx={typoStyles}>
          <FiberManualRecordIcon fontSize="small" />
          موجودی: {inventory?.fullInvestory != null
            ? toPersianPrice(inventory.fullInvestory)
            : '-'
          }
        </Typography>

        <Typography sx={typoStyles}>
          <LocationPinIcon fontSize="small" />
          در انبار: {inventory?.warehouse != null
            ? toPersianPrice(inventory.warehouse)
            : '-'
          }
        </Typography>

        <Typography sx={typoStyles}>
          <PersonRoundedIcon fontSize="small" />
          فروشنده: {inventory?.escrowBalance != null
            ? toPersianPrice(inventory.escrowBalance)
            : '-'
          }
        </Typography>
      </Box>
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
            label='واحد'
            onChange={onUnitChange}
            input={
              <OutlinedInput
                label='واحد'
                sx={{
                  '& .MuiOutlinedInput-notchedOutline span': {
                    opacity: 1,
                    position: 'absolute',
                    top: '-8px',
                    left: '4px',
                    backgroundColor: 'var(--background-paper)'
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