export interface Account {
  ididentity: string;
  tabagheAcc: string;
  groupAcc: string;
  kolAcc: string;
  moeinAcc: string;
  tafziliAcc: string;
  codeAccLen: string;
  codeAcc: number;
  title: string;
  description: string;
  systemy: boolean;
  accType: boolean;
  accessWorkGroupId: string;
  activate: boolean;
  genderId?: number;
  // dateTime: string,
  // userIdMng: string,
  // userIpMng: string
}

export interface AccountSale {
  codeAcc: number;
  title: string;
  description: string;
  contactId: number;
  contactGroupId: number;
  codeAccConnect: number;
  genderId: number;
  nationalId: string;
  foreignNational: boolean;
  accountsSaleContactDetails: {
    ididentity: number;
    countryNumber: number;
    provinceNumber: number;
    numberId: number;
    numberDescription: number;
    description: string;
  }[];
}