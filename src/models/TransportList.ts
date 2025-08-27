// Updated TransportList interface to match new API response structure
// Changed from flat structure to nested structure with listDistance[] and listItemVehicleShipp[]
export interface TransportList {
  listDistance: {
    ididentity: number;
    projectId: number;
    companyId: number;
    warehouseId: number;
    distance: number;
    duration: number;
    durationTraffic: number;
    slopeUp: number;
    slopeDown: number;
    elevation: number;
    dateTime: string;
    userIdMng: number;
    userIpMng: string;
  }[];
  listItemVehicleShipp: {
    fare: {
      success: boolean;
      message: string;
      fullFare: number;
      fare: number;
      fareDelay: number;
      comission: number;
      coefficientRoadTypeFare: number;
      costsCompany: number;
      loadingCost: number;
      unloadingCost: number;
    };
    sumLoadingItemVehicleShipp: number;
    categoryMid: string;
    codeAccSellerFid: string;
    codeAccSupplierFid: string;
    transit: boolean;
    vehicleId: number;
    alongCompony: boolean;
    alongParentsId: string | null;
    exceptParentsId: string | null;
    capacity: number;
    vehicleCostIds: any | null;
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
    clockLimitVehiclesCost: boolean;
    optionallyVehiclesCost: boolean;
    comission: number;
    limitOfHoursVehiclesCost: string | null;
    limitToHoursVehiclesCost: string | null;
    geofencesIdVehiclesCost: number;
  }[];
}

// Helper type to extract individual transport items from the nested structure
// This represents a single item from listItemVehicleShipp array for easier type handling
export type TransportItem = TransportList['listItemVehicleShipp'][0];

export interface TransportTableProps {
  data: TransportList[];
  loading?: boolean;
}

