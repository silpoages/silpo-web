import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { ForgotPassword } from '@/pages/Forgot Password/ForgotPassword';
import { Login } from '@/pages/Login/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}

export default App;
