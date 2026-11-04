import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Farms from "./pages/Farms";
import Crops from "./pages/Crops";
import Weather from "./pages/Weather";
import Resources from "./pages/Resources";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farms"
            element={
              <ProtectedRoute>
                <Farms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/crops"
            element={
              <ProtectedRoute>
                <Crops />
              </ProtectedRoute>
            }
          />

          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;