import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { AppProvider, useApp } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

// Lazy-loaded pages (code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Farms = lazy(() => import('./pages/Farms'));
const Crops = lazy(() => import('./pages/Crops'));
const Weather = lazy(() => import('./pages/Weather'));
const Resources = lazy(() => import('./pages/Resources'));
const Orders = lazy(() => import('./pages/Orders'));
const Community = lazy(() => import('./pages/Community'));
const Admin = lazy(() => import('./pages/Admin'));

function Guard({ roles, children }) {
  const { user, ready } = useApp();
  if (!ready) return <div className="p-5 text-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading…</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login register />} />
        <Route element={<Guard><Layout /></Guard>}>
          <Route index element={<Dashboard />} />
          <Route path="farms" element={<Farms />} />
          <Route path="crops" element={<Crops />} />
          <Route path="weather" element={<Weather />} />
          <Route path="resources" element={<Resources />} />
          <Route path="orders" element={<Orders />} />
          <Route path="community" element={<Community type="forum" />} />
          <Route path="consult" element={<Community type="consultation" />} />
          <Route path="admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter><AppProvider><App /></AppProvider></BrowserRouter></React.StrictMode>
);
