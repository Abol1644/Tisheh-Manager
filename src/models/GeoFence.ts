export interface GeoFence {
  id: number;
  title: string | null;
  polygon: string | null;
  area: number;
  limitOfHours: string | null;
  limitToHours: string | null;
  inTrafficZone: boolean;
  exceptComission: boolean;
  exceptWarehouse: boolean;
  exceptTransit: boolean;
  exceptAlternate: boolean;
  exceptPreSell: boolean;
  exceptVehicleId: number | null;
  description: string | null;
}
