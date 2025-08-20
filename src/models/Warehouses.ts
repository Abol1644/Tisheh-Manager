export interface Warehouse {
  id: number;
  dependentOnInventoryInWarehouse: number;
  virtualWarehouse: boolean;
  sort: number;
  title: string;
  description: string;
  codeAcc: number;
  float: number;
  longitude: number;
  latitude: number;
  elevation: number;
  accessWorkGroupId: string;
  activate: boolean;
}
