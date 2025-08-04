import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const tokenStorage = localStorage.getItem("token");

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

// Función para verificar si el token está expirado
const isTokenExpired = (token) => {
  if (!token) return true
  
  const decoded = parseJwt(token)
  if (!decoded || !decoded.exp) return true
  
  const currentTime = Date.now() / 1000
  return decoded.exp < currentTime
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(tokenStorage);

  // Verificar expiración del token al cargar y periódicamente
  useEffect(() => {
    // Verificar inmediatamente si el token está expirado
    if (token && isTokenExpired(token)) {
      Logout()
      return
    }

    // Verificar cada minuto si el token sigue válido
    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        Logout()
      }
    }, 60000) // Verificar cada 60 segundos

    return () => clearInterval(interval)
  }, [token])

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
    // Redirigir al login cuando se hace logout
    window.location.href = '/';
  };

  // Función para verificar si el token es válido
  const isValidToken = () => {
    return token && !isTokenExpired(token)
  }

  const data = {
    token,
    Login,
    Logout,
    isValidToken
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
