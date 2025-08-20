// utils/filterVehicleCosts.ts
import { TransportList } from "@/models/TransportList";

export const filterVehicleCosts = (
  items: TransportList[] | null | undefined,
  activateProportional: boolean,
  vehiclesCostOptionally: boolean,
  vehiclesCostConditional: boolean
): TransportList[] => {
  // Null or empty check
  if (!items || items.length === 0) {
    return [];
  }

  return items.filter((item) => {
    // Rule 1: If NOT activated, exclude items that are proportional
    if (!activateProportional && item.inProportionLoadingCapacityVehiclesCost) {
      return false;
    }

    // Rule 2: Three mutually exclusive cases
    return (
      // Case 1: Optionally is ON → include only items marked as optional
      (vehiclesCostOptionally && item.optionallyVehiclesCost) ||
      // Case 2: Conditional is ON → include only items with clock limit OR in traffic zone
      (vehiclesCostConditional && item.clockLimitVehiclesCost) ||
      // Case 3: Both flags OFF → include only items that are NOT optional AND NOT conditional
      (!vehiclesCostOptionally &&
        !vehiclesCostConditional &&
        !item.optionallyVehiclesCost &&
        !item.clockLimitVehiclesCost)
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
      vehicleId, alternate,transit, vehicleTitle, capacity, fare,
      ididentityShipp, dateTimeShipp,
      // Keep these
      ...costItem
    } = item;

    grouped[key].costs.push(costItem);
  });

  return grouped;
}