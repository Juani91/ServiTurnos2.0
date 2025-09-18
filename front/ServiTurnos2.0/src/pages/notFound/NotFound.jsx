import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/authentication/AuthContext'
import { Container } from 'react-bootstrap'
import './NotFound.css'

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
    navigate(token && userType ? '/home' : '/')
  }

  return (
    <div className="notfound-container">
      <Container className="text-center text-white">
        <div className="notfound-icon mb-3">⚠️</div>
        
        <h1 className="notfound-title mb-3">404 - Página no encontrada</h1>
        
        <p className="notfound-message mb-4">
          La página que estás buscando no existe o no tienes permisos para visitarla.
        </p>
        
        <p 
          className="notfound-link" 
          onClick={handleGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleGoHome()}
        >
          {token ? 'Volver al inicio' : 'Ir al login'}
        </p>
      </Container>
    </div>
  )
}

export default NotFound
