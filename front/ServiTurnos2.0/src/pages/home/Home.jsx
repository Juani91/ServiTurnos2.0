import { useAuth } from '../../services/authentication/AuthContext'
import { Container, Row, Col, Card } from 'react-bootstrap'
import './Home.css'

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

  const userTypeConfig = {
    Admin: {
      title: '¡Bienvenido a ServiTurnos!',
      message: `Hola ${userName}, desde aquí puede gestionar todos los aspectos de ServiTurnos.`,
      features: [
        { icon: '👤', title: 'Perfil', description: 'Visualice y modifique sus datos personales de administrador.' },
        { icon: '👥', title: 'Ver Usuarios', description: 'Acceda al listado completo de usuarios registrados y adminístrelos de manera eficiente.' },
        { icon: '📅', title: 'Ver Citas', description: 'Supervise todas las citas pactadas y pendientes del sistema para un control integral.' }
      ]
    },
    Customer: {
      title: '¡Bienvenido a ServiTurnos!',
      message: `Hola ${userName}, encuentre a los mejores profesionales para sus necesidades.`,
      features: [
        { 
          icon: '👤', 
          title: 'Perfil', 
          description: 'Visualice y modifique sus datos personales.',
          highlight: 'Complete su perfil al 100% para acceder a la lista de profesionales disponibles.'
        },
        { icon: '🔍', title: 'Buscar Profesionales', description: 'Explore nuestro directorio de profesionales calificados y solicite turnos según sus necesidades.' },
        { icon: '📋', title: 'Mis Citas', description: 'Gestione sus citas programadas y manténgase al día con las solicitudes pendientes de confirmación.' }
      ]
    },
    Professional: {
      title: '¡Bienvenido a ServiTurnos!',
      message: `Hola ${userName}, gestione su actividad profesional y conecte con nuevos clientes.`,
      features: [
        { 
          icon: '👤', 
          title: 'Perfil', 
          description: 'Actualice sus datos profesionales.',
          highlight: 'Mantenga su perfil completo al 100% para aparecer en las búsquedas de los clientes.'
        },
        { icon: '📨', title: 'Solicitudes', description: 'Revise y gestione las solicitudes de trabajo enviadas por clientes interesados en sus servicios.' },
        { icon: '🗓️', title: 'Mis Citas', description: 'Organice y administre su agenda de citas confirmadas con sus clientes.' }
      ]
    }
  }

  const config = userTypeConfig[userType] || {
    title: '¡Bienvenido a ServiTurnos!',
    message: 'La plataforma que conecta profesionales con clientes de manera eficiente y confiable.',
    features: []
  }

  return (
    <main className="home-serviturnos">
      <Container className="home-content">
        <Row>
          <Col>
            <h1 className="text-center mb-4">{config.title}</h1>
            <p className="welcome-message text-center">
              {config.message.includes('Hola') ? (
                <>
                  {config.message.split(',')[0]}, <strong>{config.message.split(', ')[1]}</strong>
                </>
              ) : (
                config.message
              )}
            </p>
          </Col>
        </Row>
        
        {config.features.length > 0 && (
          <Row className="features-grid">
            {config.features.map((feature, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center">
                    <div className="feature-icon mb-3">{feature.icon}</div>
                    <Card.Title as="h3" className="mb-3">{feature.title}</Card.Title>
                    <Card.Text>
                      {feature.description}
                      {feature.highlight && (
                        <>
                          <br />
                          <strong className="text-danger">{feature.highlight}</strong>
                        </>
                      )}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </main>
  )
}

export default Home