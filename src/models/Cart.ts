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
