export interface CategorySale {
  id: number;
  parentId1: number;
  parentId: number;
  parentSid: string;
  complementary: string;
  sort: number;
  title: string;
  titleEn: string;
  product: boolean;
  service: boolean;
  percentWarehouse: number;
  percentTransit: number;
  accessWorkGroupId: string;
  activate: boolean;
}
