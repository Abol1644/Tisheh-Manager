import { useMemo } from 'react';
import { TransportItem, ItemResaultPrice } from '@/models';

interface PriceResult {
  resultPrice: number; // final price per unit (base + transport)
  price: number;       // base price per unit (e.g. 3,940,000)
  disPrice: number;    // discount amount (e.g. 470,000)
}

export const usePriceCalculator = (
  item: ItemResaultPrice | null,
  capacity: number,
  selectedTransport: TransportItem | null = null
): PriceResult => {
  return useMemo(() => {
    if (!item || capacity <= 0) {
      return { resultPrice: 0, price: 0, disPrice: 0 };
    }

    let basePrice = 0;
    let disPrice = 0;

    const {
      activatePreSell,
      activateTransit,
      activateAlternate,
      activateWarehouse,
      promotionMajor,
      promotionTimeKeeper,
      priceWarehouse,
      priceAlternate,
      priceTransit,
      pricePreSellTransit: pricePreSell,
      discountPriceWarehouse,
      discountPriceWarehouse1,
      discountPriceWarehouse2,
      lowestNumberOfDiscount,
      percentageDiscount,
      lowestNumberOfDiscount1,
      percentageDiscount1,
      lowestNumberOfDiscount2,
      percentageDiscount2,
    } = item;

    // === 1. Check if we qualify for Major Promotion (Warehouse Discount) ===
    const qualifiesForDiscountTier1 =
      activateWarehouse &&
      promotionMajor &&
      capacity >= lowestNumberOfDiscount &&
      percentageDiscount > 0;

    const qualifiesForDiscountTier2 =
      activateWarehouse &&
      promotionMajor &&
      !qualifiesForDiscountTier1 && // only if tier1 not met
      capacity >= lowestNumberOfDiscount1 &&
      percentageDiscount1 > 0;

    const qualifiesForDiscountTier3 =
      activateWarehouse &&
      promotionMajor &&
      !qualifiesForDiscountTier1 &&
      !qualifiesForDiscountTier2 &&
      capacity >= lowestNumberOfDiscount2 &&
      percentageDiscount2 > 0;

    if (selectedTransport?.transit) {
      basePrice = priceTransit;
    } else if (selectedTransport?.alternate) {
      basePrice = priceAlternate;
    }
    else if (qualifiesForDiscountTier1) {
      basePrice = discountPriceWarehouse;
      disPrice = priceWarehouse - discountPriceWarehouse;
    } else if (qualifiesForDiscountTier2) {
      basePrice = discountPriceWarehouse1;
      disPrice = priceWarehouse - discountPriceWarehouse1;
    } else if (qualifiesForDiscountTier3) {
      basePrice = discountPriceWarehouse2;
      disPrice = priceWarehouse - discountPriceWarehouse2;
    }
    // else if (selectedTransport?.pre) {
    //   basePrice = pricePreSell;
    // }
    else {
      basePrice = priceWarehouse;
    }

    // === 3. Calculate transport cost per unit ===
    let transportCostPerUnit = 0;
    if (selectedTransport && capacity > 0) {
      const totalTransportCost =
        // (selectedTransport.fare?.fullFare ?? 0) +
        (selectedTransport.fare?.fullFare ?? 0) +
        (selectedTransport.priceVehiclesCost ?? 0);
      transportCostPerUnit = totalTransportCost / capacity;

    }

    // === 4. Final result: base price + per-unit transport ===
    return {
      resultPrice: basePrice + transportCostPerUnit,
      price: basePrice,
      disPrice,
    };
  }, [item, capacity, selectedTransport]);
};

export const useRoundedPrice = (value: number | null | undefined): number => {
  return useMemo(() => {
    if (value == null || isNaN(value)) return 0;

    const num = Math.floor(value); // truncate decimal part (like (long) in C#)

    if (num <= 9) return num;

    const digits = num.toString().length;

    if (digits > 6) {
      // 7+ digits → round to nearest 10,000
      const remainder = num % 10000;
      if (remainder === 5000) return num;
      return remainder >= 5000 ? num + (10000 - remainder) : num - remainder;
    }

    if (digits > 5) {
      // 6 digits → round to nearest 1,000
      const remainder = num % 1000;
      if (remainder === 500) return num;
      return remainder > 500 ? num + (1000 - remainder) : num - remainder;
    }

    if (digits > 4) {
      // 5 digits → round to nearest 100
      const remainder = num % 100;
      if (remainder === 50) return num;
      return remainder > 50 ? num + (100 - remainder) : num - remainder;
    }

    if (digits > 1) {
      // 2–4 digits → round to nearest 10
      const remainder = num % 10;
      if (remainder === 5) return num;
      return remainder > 5 ? num + (10 - remainder) : num - remainder;
    }

    return num;
  }, [value]);
};