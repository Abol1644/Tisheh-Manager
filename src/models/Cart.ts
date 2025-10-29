// src\models\Cart.ts
export interface Cart {
  id: number;
  codeAccCustomer: number;
  projectIdCustomer: number;
  byWhom: string;
  branchCenterDelivery: boolean;
  fastSending: boolean;
  preSell: boolean;
  transit: boolean;
  alternate: boolean;
  installment: boolean;
  warehouseId: number;
  valueDeliveryService: number;
  vehicleId: number;
}

export interface CartDetails {
  id: number;
  cash: boolean;
  codeAccCustomer: number;
  projectIdCustomer: number;
  byWhom: string | null;
  branchCenterDelivery: boolean;
  fastSending: boolean;
  preSell: boolean;
  transit: boolean;
  alternate: boolean;
  installment: boolean;
  warehouseId: number;
  valueDeliveryService: number;
  vehicleId: number | null;
  dateTime: string;
  userIdMng: number;
  userIpMng: string;
}

export interface ListCart {
  id: number;
  codeAccCustomer: number;
  projectIdCustomer: number;
  byWhom: string;
  branchCenterDelivery: boolean;
  fastSending: boolean;
  preSell: boolean;
  transit: boolean;
  warehouseId: number;
  vehicleId: number;
  name: string;
  lastName: string;
  codeAccCustomerTitle: string;
  projectIdCustomerTitle: string;
  postalCode: number;
  longitude: number;
  latitude: number;
  elevation: number;
  address: string;
  recipientName: string;
  recipientNumber: number;
  genderId: number;
  genderTitle: string;
  contactId: number;
  office: string;
  nationalId: number;
  foreignNational: boolean;
  alternate: boolean;
  installment: boolean;
  valueDeliveryService: number;
}

export interface CartOptions {
  warehouseId: number;
  deliveryMethod: string | null;
  deliveryMethodBot: string | null;
  deliveryDate: string | null;
  deliverySource: string | null;
}

export interface CartShipment {
  id: number;
  warehouseId: number | null;
  deliveryMethod: string | null;
  deliveryDate: string | null;
}

export interface CartItem {
  ididentity?: number; // missing = new item
  cartId: number;
  priceId: number;
  valueId: number;
  value: number; // quantity
}