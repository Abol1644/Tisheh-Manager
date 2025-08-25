import { TransportList, TransportItem } from "@/models/";

// Updated to work with new nested TransportList structure
// Now flattens listItemVehicleShipp arrays from all transport lists before filtering
export const filterVehicleCosts = (
  items: TransportList[] | null | undefined,
  vehiclesCostOptionally: boolean | null,
  vehiclesCostConditional: boolean
): TransportItem[] => {
  if (!items || items.length === 0) {
    return [];
  }

  // Flatten nested structure: extract all items from listItemVehicleShipp arrays
  const flatItems = items.flatMap(transport => transport.listItemVehicleShipp);

  return flatItems.filter((item) => {
    const matchOptionallyFilter =
      vehiclesCostOptionally === null ||
      (vehiclesCostOptionally === true && item.optionallyVehiclesCost) ||
      (vehiclesCostOptionally === false && !item.optionallyVehiclesCost);

    const matchConditionalFilter =
      vehiclesCostConditional === true ||
      (!item.clockLimitVehiclesCost && !item.vehiclesCostInTrafficZone);

    return matchOptionallyFilter && matchConditionalFilter;
  });
};

// Updated to work with TransportItem[] instead of flat TransportList[]
// Groups individual transport items by vehicleId, alternate, and transit status
export function groupTransportByVehicleAndAlternate(
  transportItems: TransportItem[] | null
): Record<
  string,
  {
    
    vehicleId: number;
    alternate: boolean;
    transit: boolean;
    vehicleTitle: string;
    capacity: number;
    fare: TransportItem["fare"];
    ididentityShipp: number;
    dateTimeShipp: string;
    costs: Array<Partial<Omit<TransportItem, "fare">>>;
  }
> {
  const grouped: ReturnType<typeof groupTransportByVehicleAndAlternate> = {};

  if (!transportItems || transportItems.length === 0) return grouped;

  transportItems.forEach((item) => {
    const key = `${item.vehicleId}-${item.transit}-${item.alternate}`;

    if (!grouped[key]) {
      grouped[key] = {
        vehicleId: item.vehicleId,
        alternate: item.alternate,
        transit: item.transit,
        vehicleTitle: item.vehicleTitle,
        capacity: item.capacity,
        fare: item.fare,
        ididentityShipp: item.ididentityShipp,
        dateTimeShipp: item.dateTimeShipp,
        costs: [],
      };
    }

    // Extract cost-related fields only
    const {
      // Exclude fields already in group root
      vehicleId,
      alternate,
      transit,
      vehicleTitle,
      capacity,
      fare,
      ididentityShipp,
      dateTimeShipp,
      // Keep these
      ...costItem
    } = item;

    grouped[key].costs.push(costItem);
  });

  return grouped;
}
