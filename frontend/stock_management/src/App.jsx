import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'
import PotentialStock from './pages/potential-stock/PotentialStock'
import StockIn from './pages/stock-in/StockIn'
import StockOut from './pages/stock-out/StockOut'
import TotalStock from './pages/total-stock/TotalStock'

function PublicRoute() {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : null
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<><PublicRoute /><Login /></>} />
      <Route path="/signup" element={<><PublicRoute /><Signup /></>} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/potential-stock" element={<PotentialStock />} />
          <Route path="/stock-in" element={<StockIn />} />
          <Route path="/stock-out" element={<StockOut />} />
          <Route path="/total-stock" element={<TotalStock />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
