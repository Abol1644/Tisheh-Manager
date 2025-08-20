export interface User {
  Id: number;
  Manage: boolean;
  ParentId: number;
  FirstName: string;
  LastName: string;
  Phone: string | null;
  Mobile: string;
  Code: number;
  IsActive: boolean;
  IsBlocked: boolean;
  IsDeleted: boolean;
  RoleId: number;
  BranchId: number;
  DepartmentId: number;
  IsConfirmed: boolean;
  Permissions: string;
  IsAdmin: boolean;
  RegisterDate: string;
  IsVerified: boolean;
  UserType: number;
  Ip: string;
  Password: string;
}

export interface UserData {
  id: number;
  versionMedia: number;
  name: string;
  lastName: string;
  userName: string;
  mobile: string;
  password: string;
  confirmSms: boolean;
  confirmEmail: boolean;
  foreignCitizen: boolean;
  economicCode: number;
  registrationCode: number;
  internationalCode: number;
  login: boolean;
  accessWorkGroupId: number;
  manage: boolean;
  activate: boolean;
  systemy: boolean;
}

export interface UserTable {
  Manage?: string;
  [key: string]: any;
}

export default User;
