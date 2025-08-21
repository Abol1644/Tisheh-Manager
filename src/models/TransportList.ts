export interface TransportList {
  fare: {
    success: boolean;
    message: string;
    fullFare: number;
    fare: number;
    fareDelay: number;
    comission: number;
    coefficientRoadTypeFare: number;
  };
  sumLoadingItemVehicleShipp: number;
  categoryMid: string;
  codeAccSellerFid: string;
  codeAccSupplierFid: string;
  transit: boolean;
  vehicleId: number;
  alongCompony: boolean;
  alongParentsId: number | null;
  exceptParentsId: number | null;
  capacity: number;
  vehicleCostIds: number | null;
  branchCenterDelivery: boolean;
  sort: number;
  vehicleTitle: string;
  vehicleDescription: string | null;
  weight: number;
  volume: number;
  vehiclesCostId: number;
  vehiclesCostTitle: string;
  codeAccVehiclesCost: number;
  floatVehiclesCost: number;
  descriptionVehiclesCost: string | null;
  priceVehiclesCost: number;
  vehiclesCostProduct: boolean;
  vehiclesCostService: boolean;
  vehiclesCostGeneral: boolean;
  vehiclesCostOptionally: boolean;
  vehiclesCostInTrafficZone: boolean;
  vehiclesCostClockLimit: boolean;
  alternate: boolean;
  baseFareFixed: number;
  entranceFee: number;
  transitFareFixed: number;
  ididentity: number;
  ididentityShipp: number;
  dateTimeShipp: string;
  inProportionLoadingCapacityVehiclesCost: boolean;
  entranceDistance: number;
  entranceDuration: number;
  weight1: number;
  volume1: number;
  weight2: number;
  volume2: number;
  weight3: number;
  volume3: number;
  delayCost: number;
  slope1: number;
  slope2: number;
  slope3: number;
  inTrafficZoneVehiclesCost: boolean;
  limitOfHoursVehiclesCost: number,
  limitToHoursVehiclesCost: number,
  clockLimitVehiclesCost: boolean;
  optionallyVehiclesCost: boolean;
  comission: number;
}

export interface TransportTableProps {
  data: TransportList[];
  loading?: boolean;
}