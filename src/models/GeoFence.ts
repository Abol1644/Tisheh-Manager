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

export interface PointDetails {
  formatted_address: string;
  route_name: string;
}

export interface PointElevation {
  elevation: number;
}

export interface LocationSearchResault {
  count: number;
  items: {
    title: string;
    address: string;
    category: "municipal" | "place";
    type: 
      | "residential"
      | "primary"
      | "secondary"
      | "tertiary"
      | "company"
      | "convenience_store"
      | "building_materials"
      | "store"
      | "home_goods_store"
      | "electrician"
      | "metro_entrance"
      | "department_store";
    region: string;
    neighbourhood?: string;
    location: {
      x: number;
      y: number;
      z: "NaN";
    };
  }[];
}