"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      let parsedUser = JSON.parse(storedUser);
      if (parsedUser?.name) {
        parsedUser.name = parsedUser.name.replace(/vadhadiya pragnesh(?:kumar)? chamanbhai/gi, "Pragnesh Vadhadiya").replace(/pragneshkumar/gi, "Pragnesh");
      }
      if (parsedUser?.clinicName) {
        parsedUser.clinicName = parsedUser.clinicName.replace(/vadhadiya pragnesh(?:kumar)? chamanbhai/gi, "Pragnesh Vadhadiya").replace(/pragneshkumar/gi, "Pragnesh");
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    if (data.user?.name) {
      data.user.name = data.user.name.replace(/vadhadiya pragnesh(?:kumar)? chamanbhai/gi, "Pragnesh Vadhadiya").replace(/pragneshkumar/gi, "Pragnesh");
    }
    if (data.user?.clinicName) {
      data.user.clinicName = data.user.clinicName.replace(/vadhadiya pragnesh(?:kumar)? chamanbhai/gi, "Pragnesh Vadhadiya").replace(/pragneshkumar/gi, "Pragnesh");
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    if (data.user.role === "admin") router.push("/admin");
    else if (data.user.role === "receptionist") router.push("/receptionist");
    else if (data.user.role === "doctor") router.push("/doctor");
    else if (data.user.role === "patient") router.push("/patient");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
