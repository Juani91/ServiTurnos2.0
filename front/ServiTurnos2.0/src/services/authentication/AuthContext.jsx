import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const tokenStorage = localStorage.getItem("token");

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(tokenStorage);

  const login = async (email, password) => {
    const requestData = { email, password };

    try {
      const response = await fetch("https://localhost:7286/api/Authentication/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorMsg = await response.text(); // ← Aquí leemos el mensaje real
        return { success: false, msg: errorMsg };
      }

      const token = await response.text(); // ← Esto es el token en texto plano
      setToken(token);
      localStorage.setItem("token", token);

      return { success: true, token }; // devolvemos también el token si querés usarlo
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      return {
        success: false,
        msg: "Error de conexión con el servidor.",
      };
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const data = { token, login, logout };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar en cualquier lado
export const useAuth = () => useContext(AuthContext);
