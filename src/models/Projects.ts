export interface Project {
  id: number;
  codeAccConnect: number;
  title: string;
  postalCode: number | 0;
  nationalId: number | 0;
  longitude: number;
  latitude: number;
  elevation: number;
  address: string;
  recipientName: string | null;
  recipientNumber: string | null;
  systemy: boolean;
  dateTime: string | null;
  userIdMng: number | null;
  userIpMng: string | null;
}
