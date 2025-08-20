export interface Project {
  id: number;
  codeAccConnect: number;
  title: string;
  postalCode: string | null;
  nationalId: string | null;
  longitude: number;
  latitude: number;
  elevation: number;
  address: string;
  recipientName: string | null;
  recipientNumber: string | null;
  systemy: boolean;
}
