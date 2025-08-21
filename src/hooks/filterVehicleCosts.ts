// utils/filterVehicleCosts.ts
import { TransportList } from "@/models/TransportList";

export const filterVehicleCosts = (
  items: TransportList[] | null | undefined,
  vehiclesCostOptionally: boolean | null,
  // vehiclesCostConditional: boolean
): TransportList[] => {
  // Null or empty check
  if (!items || items.length === 0) {
    return [];
  }

  return items.filter((item) => {
    // Rule 2: Three mutually exclusive cases
    return (
      (vehiclesCostOptionally && item.optionallyVehiclesCost) ||
      (!vehiclesCostOptionally && !item.optionallyVehiclesCost ) ||
      (vehiclesCostOptionally === null && item)
    );
  });
};

export function groupTransportByVehicleAndAlternate(
  transportList: TransportList[] | null
): Record<string, {
  vehicleId: number;
  alternate: boolean;
  transit: boolean;
  vehicleTitle: string;
  capacity: number;
  fare: TransportList['fare'];
  ididentityShipp: number;
  dateTimeShipp: string;
  costs: Array<Partial<Omit<TransportList, 'fare'>>>;
}> {
  const grouped: ReturnType<typeof groupTransportByVehicleAndAlternate> = {};

  if (!transportList || transportList.length === 0) return grouped;

  transportList.forEach(item => {
    const key = `${item.vehicleId}-${item.transit}-${item.alternate}`;

    if (!grouped[key]) {
      grouped[key] = {
        vehicleId: item.vehicleId,
        alternate: item.alternate,
        transit: item.transit,
        vehicleTitle: item.vehicleTitle,
        capacity: item.capacity,
        fare: item.fare, // same for all items in same shipment
        ididentityShipp: item.ididentityShipp,
        dateTimeShipp: item.dateTimeShipp,
        costs: []
      };
    }

    // Extract cost-related fields only
    const {
      // Exclude fields already in group root
      vehicleId, alternate, transit, vehicleTitle, capacity, fare,
      ididentityShipp, dateTimeShipp,
      // Keep these
      ...costItem
    } = item;

    grouped[key].costs.push(costItem);
  });

  return grouped;
}