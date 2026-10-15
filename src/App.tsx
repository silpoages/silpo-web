import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Login } from '@/pages/Login/Login';
import { GoodPractices } from '@/pages/GoodPractices/GoodPractices';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/good-practices" element={<GoodPractices />} />
    </Routes>
  );
}

export default App;
