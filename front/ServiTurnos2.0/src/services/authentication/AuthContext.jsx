import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const tokenStorage = localStorage.getItem("token");

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(tokenStorage);

  const Login = async (email, password) => {
    const requestData = { email, password };

    try {
      const response = await fetch("https://localhost:7286/api/Authentication/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const text = await response.text(); // ✅ Leemos el texto una sola vez

      if (!response.ok) {
        return { success: false, msg: text }; // 🛑 Mensaje de error del backend
      }

      // ✅ Si el login fue exitoso, guardamos el token
      setToken(text);
      localStorage.setItem("token", text);

      return { success: true, token: text };

    } catch (error) {
      return { success: false, msg: "Error de conexión con el servidor." };
    }
  };

  const Logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const data = {
    token,
    Login,
    Logout
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
