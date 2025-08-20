import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from '@/layout/MainLayout';

import NoAccess from '@/pages/Errors/NoAccess';
import NotFound from '@/pages/Errors/NotFound';

import SignIn from '@/pages/SignIn';
import Profile from '@/pages/Profile';
import CompanySelect from '@/pages/CompanySelect';

import Supply from '@/pages/Dashboard/Supply';
import Website from '@/pages/Dashboard/webSite'
import Treasury from '@/pages/Dashboard/Treasury';
import Managment from '@/pages/Dashboard/Managment';
import Warehouse from '@/pages/Dashboard/Warehouse';
import Accounting from '@/pages/Dashboard/Accounting';
import SalePage from '@/pages/Dashboard/SalePage';
import Administrative from '@/pages/Dashboard/Administrative';
import Transportation from '@/pages/Dashboard/Transportation';

import AdminRoute from '@/components/auth/AdminRoute';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import ControlUsers from '@/pages/Managment/ControlUsers';
import AccessSystem from '@/pages/Managment/AccessSystem';
import AccessWorkGroup from '@/pages/Managment/AccessWorkGroup';
import FinanchialPeriods from '@/pages/Managment/FinanchialPeriods';

import UserLogs from '@/pages/AdminPages/Log'

import TestPage from '@/pages/test'

import { DEFAULT_MAIN_ROUTE } from '@/models/menuConfig';

function RequireCompany() {
  const hasCompany = !!localStorage.getItem('selectedCompany');
  const hasPeriod = !!localStorage.getItem('selectedPeriod');
  return (hasCompany && hasPeriod) ? <Outlet /> : <Navigate to="/select-company" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/select-company"
        element={
          <ProtectedRoute>
            <CompanySelect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RequireCompany />
          </ProtectedRoute>
        }
      />
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to={DEFAULT_MAIN_ROUTE} replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="dashboard" element={<Outlet />}>
            <Route path="administrative" element={<Administrative />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="managment" element={<Managment />} />
            <Route path="sale" element={<SalePage />} />
            <Route path="supply" element={<Supply />} />
            <Route path="transportation" element={<Transportation />} />
            <Route path="treasury" element={<Treasury />} />
            <Route path="wearhouse" element={<Warehouse />} />
            <Route path="website" element={<Website />} />
          </Route>
          <Route path="managment" element={<Outlet />}>
            <Route path="user" element={<ControlUsers />} />
            <Route path="financial" element={<FinanchialPeriods />} />
            <Route path="work-group" element={<AccessWorkGroup />} />
            <Route path="access-system" element={<AccessSystem />} />
            
          </Route>
          <Route path='system' element={<Outlet />}>
              <Route path="user-log" element={<UserLogs />} />
            </Route>
        </Route>
      <Route path="/no-access" element={<NoAccess />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
