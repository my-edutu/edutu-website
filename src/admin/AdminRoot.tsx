import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import OpportunityList from '../pages/admin/opportunities/OpportunityList';
import UsersPage from '../pages/admin/users';
import AnalyticsPage from '../pages/admin/analytics';
import AiControlPage from '../pages/admin/ai-control';
import CommunityAdminPage from '../pages/admin/community';
import CommunitySupportRoutes from '../pages/admin/community-support';
import SystemTools from '../pages/admin/system';

const AdminRoot: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="opportunities" element={<OpportunityList />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai-control" element={<AiControlPage />} />
        <Route path="community" element={<CommunityAdminPage />} />
        <Route path="system" element={<SystemTools />} />
        <Route path="community-support/*" element={<CommunitySupportRoutes />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoot;
