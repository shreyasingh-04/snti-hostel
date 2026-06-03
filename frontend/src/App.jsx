// src/App.jsx — defines all routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/layout/Navbar'

import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import SelectMenu     from './pages/SelectMenu'
import MyMenu         from './pages/MyMenu'
import Feedback       from './pages/Feedback'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Trainee-only routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="trainee"><Dashboard /></ProtectedRoute>} />
          <Route path="/menu"      element={<ProtectedRoute role="trainee"><SelectMenu /></ProtectedRoute>} />
          <Route path="/my-menu"   element={<ProtectedRoute role="trainee"><MyMenu /></ProtectedRoute>} />
          <Route path="/feedback"  element={<ProtectedRoute role="trainee"><Feedback /></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
