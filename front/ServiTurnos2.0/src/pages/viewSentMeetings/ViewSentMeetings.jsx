import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './ViewSentMeetings.css'
import '../../components/navbar/Navbar.css'

const professionMap = {
  0: "Gasista",
  1: "Electricista", 
  2: "Plomero",
  3: "Carpintero",
  4: "Albañil",
  5: "Refrigeración"
}

const meetingStatusMap = {
  0: "Pendiente",
  1: "Aceptada",
  2: "Rechazada",
  3: "Finalizada",
  4: "Cancelada"
}

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const ViewSentMeetings = () => {
  const [query, setQuery] = useState('')
  const [meetings, setMeetings] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeTab, setActiveTab] = useState('pending') // 'pending', 'accepted', 'rejected'
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [meetingToCancel, setMeetingToCancel] = useState(null)

  const { token } = useAuth()
  const { GetAllMeetingsByCustomer } = useMeetings()
  const { GetAllProfessionals } = useUsers()
  const { showToast } = useToast()

  // Obtener el ID del customer del token
  const decoded = token ? parseJwt(token) : null
  const customerId = decoded?.Id

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return

      const [meetingsRes, professionalsRes] = await Promise.all([
        GetAllMeetingsByCustomer(customerId, token),
        GetAllProfessionals(token)
      ])

      if (meetingsRes.success && professionalsRes.success) {
        // Filtrar solo meetings que estén disponibles (Available = true)
        const availableMeetings = meetingsRes.data.filter(meeting => meeting.available === true)
        setMeetings(availableMeetings)
        setProfessionals(professionalsRes.data)
        
        // Filtrar según la pestaña activa
        filterMeetingsByStatus(availableMeetings, activeTab)
      } else {
        showToast('Error al cargar las meetings', 'error')
      }
    }
    fetchData()
  }, [customerId, token, GetAllMeetingsByCustomer, GetAllProfessionals])

  useEffect(() => {
    if (meetings.length > 0) {
      filterMeetingsByStatus(meetings, activeTab)
    }
  }, [activeTab, meetings])

  const filterMeetingsByStatus = (allMeetings, status) => {
    // Doble filtrado: por disponibilidad y por estado
    const filteredMeetings = allMeetings.filter(meeting => {
      return meeting.available === true && getStatusCategory(meeting.status) === status
    })
    setFiltered(filteredMeetings)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (!value.trim()) {
      filterMeetingsByStatus(meetings, activeTab)
      return
    }

    const q = value.toLowerCase()
    
    // Filtrar por disponibilidad, estado y luego por profesional
    const meetingsByStatus = meetings.filter(meeting => {
      return meeting.available === true && getStatusCategory(meeting.status) === activeTab
    })
    
    const results = meetingsByStatus.filter(meeting => {
      const professional = getProfessionalInfo(meeting.professionalId)
      return professional && (
        professional.firstName?.toLowerCase().includes(q) ||
        professional.lastName?.toLowerCase().includes(q) ||
        professionMap[professional.profession]?.toLowerCase().includes(q)
      )
    })
    setFiltered(results)
  }

  const getStatusCategory = (status) => {
    switch (status) {
      case 0: return 'pending'    // Pendiente
      case 1: return 'accepted'   // Aceptada
      case 2: return 'rejected'   // Rechazada
      case 3: return 'accepted'   // Finalizada (se muestra en aceptadas)
      case 4: return 'rejected'   // Cancelada (se muestra en rechazadas)
      default: return 'pending'
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setQuery('') // Limpiar búsqueda al cambiar de pestaña
    filterMeetingsByStatus(meetings, tab)
  }

  const getProfessionalInfo = (professionalId) => {
    return professionals.find(prof => prof.id === professionalId)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada'
    
    const date = new Date(dateString)
    const dateOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit'
    }
    
    const formattedDate = date.toLocaleDateString('es-ES', dateOptions)
    const formattedTime = date.toLocaleTimeString('es-ES', timeOptions)
    
    return `${formattedDate}, ${formattedTime} hs`
  }

  const handleCancel = (meeting) => {
    setMeetingToCancel(meeting)
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    // Aquí implementarías la lógica para cancelar la meeting
    // Por ahora solo mostramos un toast
    showToast('Funcionalidad de cancelar meeting próximamente', 'info')
    setShowCancelModal(false)
    setMeetingToCancel(null)
  }

  const handleFinalize = async (meeting) => {
    // Aquí implementarías la lógica para finalizar la meeting
    // Por ahora solo mostramos un toast
    showToast('Funcionalidad de finalizar meeting próximamente', 'info')
  }

  const getTabCounts = () => {
    // Contar solo meetings disponibles
    const availableMeetings = meetings.filter(m => m.available === true)
    return {
      pending: availableMeetings.filter(m => getStatusCategory(m.status) === 'pending').length,
      accepted: availableMeetings.filter(m => getStatusCategory(m.status) === 'accepted').length,
      rejected: availableMeetings.filter(m => getStatusCategory(m.status) === 'rejected').length
    }
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'pending':
        return 'No se encuentran meetings pendientes'
      case 'accepted':
        return 'No se encuentran meetings aceptadas'
      case 'rejected':
        return 'No se encuentran meetings rechazadas'
      default:
        return 'No se encontraron meetings'
    }
  }

  const counts = getTabCounts()

  return (
    <Container className="view-sent-meetings">
      {/* Pestañas para cambiar entre estados de meetings */}
      <Row className="justify-content-center mb-3">
        <Col md={10}>
          <div className="d-flex gap-2">
            <div 
              className={`buttons ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => handleTabChange('pending')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Pendientes ({counts.pending})
            </div>
            <div 
              className={`buttons ${activeTab === 'accepted' ? 'active' : ''}`}
              onClick={() => handleTabChange('accepted')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Aceptadas ({counts.accepted})
            </div>
            <div 
              className={`buttons ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => handleTabChange('rejected')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Rechazadas ({counts.rejected})
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={6}>
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar por profesional..."
          />
        </Col>
      </Row>

      <Row>
        {filtered.length === 0 ? (
          <Col>
            <p className="text-center">
              {getEmptyMessage()}
            </p>
          </Col>
        ) : (
          filtered.map(meeting => {
            const professional = getProfessionalInfo(meeting.professionalId)
            return (
              <Col md={6} key={meeting.id} className="mb-4">
                <Card className="card card-meeting">
                  <Card.Img
                    variant="left"
                    src={professional?.imageURL || '/images/NoImage.webp'}
                    alt="Foto profesional"
                    className="card-img"
                  />
                  <Card.Body className="card-body">
                    <Card.Title className="card-title">
                      {professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional no encontrado'}
                      <span className="meeting-status-badge ms-2">
                        {meetingStatusMap[meeting.status]}
                      </span>
                    </Card.Title>
                    <Card.Text className="card-text">
                      <strong>Profesión:</strong> {professional ? professionMap[professional.profession] || 'No especificada' : '-'}<br />
                      <strong>Fecha:</strong> {formatDateTime(meeting.meetingDate)}<br />
                      <strong>Descripción:</strong> {meeting.jobInfo || 'Sin descripción'}
                    </Card.Text>
                    <div className="card-btn-container">
                      {meeting.status === 0 && ( // Solo para meetings pendientes
                        <Button 
                          variant="danger" 
                          className="btn-cancel"
                          onClick={() => handleCancel(meeting)}
                        >
                          Cancelar
                        </Button>
                      )}
                      {meeting.status === 1 && ( // Solo para meetings aceptadas
                        <Button 
                          variant="success" 
                          className="btn-finalize"
                          onClick={() => handleFinalize(meeting)}
                        >
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })
        )}
      </Row>

      {/* Modal de confirmación para cancelar meeting */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar cancelación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés cancelar esta meeting con{' '}
            <strong>
              {meetingToCancel && getProfessionalInfo(meetingToCancel.professionalId) ? 
                `${getProfessionalInfo(meetingToCancel.professionalId).firstName} ${getProfessionalInfo(meetingToCancel.professionalId).lastName}` : 
                'este profesional'}
            </strong>?
          </p>
          <p className="text-warning">
            <small>Esta acción no se puede deshacer.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, mantener
          </Button>
          <Button variant="danger" onClick={confirmCancel}>
            Sí, cancelar meeting
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ViewSentMeetings