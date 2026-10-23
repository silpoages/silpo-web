import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DailyMessages } from '@/pages/DailyMessages/DailyMessages';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { GoodPractices } from '@/pages/GoodPractices/GoodPractices';
import { Login } from '@/pages/Login/Login';
import { Meditations } from '@/pages/Meditations/Meditations';
import { Users } from '@/pages/Users/Users';
import { ForgotPassword } from '@/pages/Forgot Password/ForgotPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/good-practices" element={<GoodPractices />} />
        <Route path="/daily-messages" element={<DailyMessages />} />
        <Route path="/meditations" element={<Meditations />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default App;
