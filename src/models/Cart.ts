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
