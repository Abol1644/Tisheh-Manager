export interface Distance {
  ididentity: number;
  projectId: number;
  companyId: number;
  warehouseId: number;
  distance: number;
  duration: number;
  durationTraffic: number;
  slopeUp: Float32Array;
  slopeDown: number;
  elevation: number;
}
