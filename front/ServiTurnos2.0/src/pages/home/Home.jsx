import { useAuth } from '../../services/authentication/AuthContext'
import './Home.css'

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const Home = () => {
  const { token } = useAuth()
  const decoded = token ? parseJwt(token) : null
  const userType = decoded?.UserType
  const userName = decoded?.Name || 'Usuario'

  const renderContent = () => {
    switch (userType) {
      case 'Admin':
        return (
          <div className="home-content">
            <h1>¡Bienvenido a ServiTurnos!</h1>
            <p className="welcome-message">
              Hola <strong>{userName}</strong>, desde aquí puede gestionar todos los aspectos de ServiTurnos.
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <h3>Perfil</h3>
                <p>Visualice y modifique sus datos personales de administrador.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Ver Usuarios</h3>
                <p>Acceda al listado completo de usuarios registrados y adminístrelos de manera eficiente.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3>Ver Citas</h3>
                <p>Supervise todas las citas pactadas y pendientes del sistema para un control integral.</p>
              </div>
            </div>
          </div>
        )
      
      case 'Customer':
        return (
          <div className="home-content">
            <h1>¡Bienvenido a ServiTurnos!</h1>
            <p className="welcome-message">
              Hola <strong>{userName}</strong>, encuentre a los mejores profesionales para sus necesidades.
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <h3>Perfil</h3>
                <p>Visualice y modifique sus datos personales. <br /> <strong>Importante:</strong> Complete su perfil al 100% para acceder a la lista de profesionales disponibles.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Buscar Profesionales</h3>
                <p>Explore nuestro directorio de profesionales calificados y solicite turnos según sus necesidades.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Mis Citas</h3>
                <p>Gestione sus citas programadas y manténgase al día con las solicitudes pendientes de confirmación.</p>
              </div>
            </div>
          </div>
        )
      
      case 'Professional':
        return (
          <div className="home-content">
            <h1>¡Bienvenido a ServiTurnos!</h1>
            <p className="welcome-message">
              Hola <strong>{userName}</strong>, gestione su actividad profesional y conecte con nuevos clientes.
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <h3>Perfil</h3>
                <p>Actualice sus datos profesionales. <strong>Importante:</strong> Mantenga su perfil completo al 100% para aparecer en las búsquedas de clientes.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📨</div>
                <h3>Solicitudes</h3>
                <p>Revise y gestione las solicitudes de trabajo enviadas por clientes interesados en sus servicios.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🗓️</div>
                <h3>Mis Citas</h3>
                <p>Organice y administre su agenda de citas confirmadas con sus clientes.</p>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="home-content">
            <h1>¡Bienvenido a ServiTurnos!</h1>
            <p className="welcome-message">
              La plataforma que conecta profesionales con clientes de manera eficiente y confiable.
            </p>
          </div>
        )
    }
  }

  return (
    <main className="home-serviturnos">
      {renderContent()}
    </main>
  )
}

export default Home