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

const ProfessionalProtected = ({ children }) => {
  const { token } = useAuth()
  
  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/" />
  }
  
  const decoded = parseJwt(token)
  const userType = decoded?.UserType
  
  // Si no es Professional, remover token y redirigir
  if (userType !== 'Professional') {
    localStorage.removeItem('token')
    return <Navigate to="/" />
  }
  
  return <div>{children}</div>
}

export default ProfessionalProtected
