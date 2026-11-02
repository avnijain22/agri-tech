import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem("agritechUser"));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUser);

  const saveUser = (data) => {
    localStorage.setItem("agritechUser", JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveUser(data);
    return data;
  };

  const register = async (form) => {
    const { data } = await api.post("/auth/register", form);
    saveUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("agritechUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
