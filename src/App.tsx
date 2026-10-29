import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DailyMessages } from '@/pages/DailyMessages/DailyMessages';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { GoodPractices } from '@/pages/GoodPractices/GoodPractices';
import { Login } from '@/pages/Login/Login';
import { Meditations } from '@/pages/Meditations/Meditations';
import { Users } from '@/pages/Users/Users';
import { ForgotPassword } from '@/pages/ForgotPassword/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/good-practices" element={<GoodPractices />} />
          <Route path="/daily-messages" element={<DailyMessages />} />
          <Route path="/meditations" element={<Meditations />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
