export const menuRoutes = [
  {
    label: 'داشبورد',
    path: '/dashboard',
    children: [
      { label: 'مدیریت', path: '/dashboard/managment' },
      { label: 'اداری', path: '/dashboard/administrative' },
      { label: 'حسابداری', path: '/dashboard/accounting' },
      { label: 'فروش', path: '/dashboard/sale' },
      { label: 'تامین', path: '/dashboard/supply' },
      { label: 'حمل و نقل', path: '/dashboard/transportation' },
      { label: 'خزانه داری', path: '/dashboard/treasury' },
      { label: 'انبار', path: '/dashboard/wearhouse' },
      { label: 'وب سایت', path: '/dashboard/Website' },
    ],
  },
  {
    label: 'مدیریت',
    path: '/managment',
    children: [
      { label: 'کاربران', path: '/managment/user' },
      { label: 'دوره‌های مالی', path: '/managment/financial' },
      { label: 'گروه های کاربری', path: '/managment/work-group' },
      { label: 'گروه های دسترسی', path: '/managment/access-system' },
      {
        label: 'مدیریت سیستم',
        path: '/system',
        children: [
          { label: 'رفتار کاربران', path: '/system/user-log' },
        ]
      },
    ],
  },
];

import GroupIcon from '@mui/icons-material/Group';
import FolderIcon from '@mui/icons-material/Folder';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import KeyIcon from '@mui/icons-material/Key';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const ROUTE_ICON_MAP = {
  "داشبورد": DashboardIcon,
  "مدیریت کاربران": GroupIcon,
  "دوره‌های مالی": AttachMoneyIcon,
  "گروه های کاربری": KeyIcon,
  "مدیریت": AdminPanelSettingsIcon,
};

export const DEFAULT_MAIN_ROUTE = '/dashboard/managment';
