import { useMemo } from 'react';

// Assuming ItemResaultPrice is already defined as per your interface
export interface ItemResaultPrice {
  pricesClass: {
    resultPrice: number;
    price: number;
    priceVat: number;
    disPrice: number;
    priceAvgShipp: number;
  };
  // ... all other fields (as provided)
  activatePreSell: boolean;
  activateTransit: boolean;
  activateAlternate: boolean;
  promotionMajor: boolean;
  promotionTimeKeeper: boolean;
  priceWarehouse: number;
  priceAlternate: number;
  priceTransit: number;
  pricePreSellTransit: number; // Used as PreSell price
  discountPriceWarehouse: number;
  discountPriceWarehouse1: number;
  discountPriceWarehouse2: number;
  lowestNumberOfDiscount: number;
  percentageDiscount: number;
  lowestNumberOfDiscount1: number;
  percentageDiscount1: number;
  lowestNumberOfDiscount2: number;
  percentageDiscount2: number;
  promotionStartDateTime: string | null;
  promotionExpireDateTime: string | null;
  // Add any other used fields — rest are assumed present
}

interface PriceResult {
  resultPrice: number;
  price: number;
  disPrice: number;
}

/**
 * Custom React Hook to calculate dynamic pricing based on item status, promotions, and capacity.
 *
 * @param item - The item data containing pricing and promotion flags
 * @param capacity - The quantity/capacity (e.g., user-selected amount) to evaluate tiered discounts
 * @returns Calculated prices: resultPrice, base price, and discount amount
 */
export const usePriceCalculator = (
  item: ItemResaultPrice | null,
  capacity: number
): PriceResult => {
  return useMemo(() => {
    // Handle null/undefined item
    if (!item) {
      return { resultPrice: 0, price: 0, disPrice: 0 };
    }

    let resultPrice = 0;
    let price = 0;
    let disPrice = 0;

    const {
      activatePreSell,
      activateTransit,
      activateAlternate,
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
      promotionStartDateTime,
      promotionExpireDateTime,
    } = item;

    // Normalize current date to compare with promotion dates (ignore time)
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Check if time-based promotion is active
    let isPromoActive = false;
    if (promotionTimeKeeper && promotionStartDateTime && promotionExpireDateTime) {
      const startDate = new Date(promotionStartDateTime);
      const endDate = new Date(promotionExpireDateTime);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      isPromoActive = startDate <= now && now <= endDate;
    }

    // Priority: PreSell → Transit → Alternate → Warehouse (with discounts)
    if (activatePreSell) {
      resultPrice = pricePreSell;
      price = pricePreSell;
    } else if (activateTransit) {
      resultPrice = priceTransit;
      price = priceTransit;
    } else if (activateAlternate) {
      resultPrice = priceAlternate;
      price = priceAlternate;
    } else {
      // Default to warehouse price
      resultPrice = priceWarehouse;
      price = priceWarehouse;

      // Apply Major Promotion (tiered by capacity)
      if (promotionMajor) {
        if (capacity >= lowestNumberOfDiscount && percentageDiscount > 0) {
          resultPrice = discountPriceWarehouse;
          disPrice = priceWarehouse - discountPriceWarehouse;
        } else if (capacity >= lowestNumberOfDiscount1 && percentageDiscount1 > 0) {
          resultPrice = discountPriceWarehouse1;
          disPrice = priceWarehouse - discountPriceWarehouse1;
        } else if (capacity >= lowestNumberOfDiscount2 && percentageDiscount2 > 0) {
          resultPrice = discountPriceWarehouse2;
          disPrice = priceWarehouse - discountPriceWarehouse2;
        }
      }
      // Apply TimeKeeper Promotion (date-based)
      else if (isPromoActive) {
        if (percentageDiscount > 0 && percentageDiscount1 === 0 && percentageDiscount2 === 0) {
          resultPrice = discountPriceWarehouse;
          disPrice = priceWarehouse - discountPriceWarehouse;
        } else if (percentageDiscount1 > 0 && percentageDiscount2 === 0) {
          resultPrice = discountPriceWarehouse1;
          disPrice = priceWarehouse - discountPriceWarehouse1;
        } else if (percentageDiscount2 > 0) {
          resultPrice = discountPriceWarehouse2;
          disPrice = priceWarehouse - discountPriceWarehouse2;
        }
      }
    }

    return { resultPrice, price, disPrice };
  }, [item, capacity]); // Recalculate only when item or capacity changes
};