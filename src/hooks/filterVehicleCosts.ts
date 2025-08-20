// utils/filterVehicleCosts.ts
import { TransportList } from "@/models/TransportList";

const filterVehicleCosts = (
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
      (vehiclesCostConditional &&
        (item.clockLimitVehiclesCost || item.inTrafficZoneVehiclesCost)) ||
      // Case 3: Both flags OFF → include only items that are NOT optional AND NOT conditional
      (!vehiclesCostOptionally &&
        !vehiclesCostConditional &&
        !item.optionallyVehiclesCost &&
        !item.clockLimitVehiclesCost &&
        !item.inTrafficZoneVehiclesCost)
    );
  });
};
export default filterVehicleCosts;
