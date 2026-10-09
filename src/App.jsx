import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RiderProvider } from './context/RiderContext';
import RiderLayout from './components/RiderLayout';
import Login from './pages/Login';
import Verify from './pages/Verify';
import InstallGuide from './pages/InstallGuide';
import Register from './pages/Register';
import Pending from './pages/Pending';
import Jobs from './pages/Jobs';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <RiderProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/install" element={<InstallGuide />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/" element={<RiderLayout />}>
            <Route index element={<Jobs />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RiderProvider>
    </AuthProvider>
  );
}