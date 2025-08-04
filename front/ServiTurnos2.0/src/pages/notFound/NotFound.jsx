import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/authentication/AuthContext'
import './NotFound.css'

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const NotFound = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const decoded = token ? parseJwt(token) : null
  const userType = decoded?.UserType

  const handleGoHome = () => {
    if (token && userType) {
      navigate('/home')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">⚠️</div>
        
        <h1 className="notfound-title">404 - Página no encontrada</h1>
        
        <p className="notfound-message">
          La página que estás buscando no existe o no tienes permisos para visitarla.
        </p>
        
        <p className="notfound-link" onClick={handleGoHome}>
          {token ? 'Volver al inicio' : 'Ir al login'}
        </p>
      </div>
    </div>
  )
}

export default NotFound
