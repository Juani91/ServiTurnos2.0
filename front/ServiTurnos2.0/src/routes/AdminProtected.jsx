import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../services/authentication/AuthContext'

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const AdminProtected = ({ children }) => {
  const { token, isValidToken } = useAuth()
  
  // Si no hay token válido, redirigir al login
  if (!isValidToken()) {
    return <Navigate to="/" replace />
  }
  
  const decoded = parseJwt(token)
  const userType = decoded?.UserType
  
  // Si no es Admin, mostrar página 404
  if (userType !== 'Admin') {
    return <Navigate to="/404" replace />
  }
  
  return children
}

export default AdminProtected
