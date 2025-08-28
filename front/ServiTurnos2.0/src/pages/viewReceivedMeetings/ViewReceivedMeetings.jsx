import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './ViewReceivedMeetings.css'

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const ViewReceivedMeetings = () => {
  const [query, setQuery] = useState('')
  const [meetings, setMeetings] = useState([])
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [meetingToAccept, setMeetingToAccept] = useState(null)
  const [meetingToReject, setMeetingToReject] = useState(null)

  const { token } = useAuth()
  const { GetPendingMeetings, AcceptMeeting, RejectMeeting } = useMeetings()
  const { GetAllCustomers } = useUsers()
  const { showToast } = useToast()

  // Obtener el ID del profesional del token
  const decoded = token ? parseJwt(token) : null
  const professionalId = decoded?.Id

  const fetchMeetings = async () => {
    if (!professionalId) return

    const [meetingsRes, customersRes] = await Promise.all([
      GetPendingMeetings(professionalId, token),
      GetAllCustomers(token)
    ])

    if (meetingsRes.success && customersRes.success) {
      // Filtrar solo meetings que estén disponibles (Available = true)
      const availableMeetings = meetingsRes.data.filter(meeting => meeting.available === true)
      setMeetings(availableMeetings)
      setCustomers(customersRes.data)
      setFiltered(availableMeetings)
    } else {
      showToast('Error al cargar las solicitudes', 'error')
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [professionalId, token])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (!value.trim()) {
      setFiltered(meetings)
      return
    }

    const q = value.toLowerCase()
    // Filtrar solo meetings disponibles en la búsqueda también
    const results = meetings.filter(meeting => {
      const customer = getCustomerInfo(meeting.customerId)
      return meeting.available === true && customer && (
        customer.firstName?.toLowerCase().includes(q) ||
        customer.lastName?.toLowerCase().includes(q)
      )
    })
    setFiltered(results)
  }

  const getCustomerInfo = (customerId) => {
    return customers.find(customer => customer.id === customerId)
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

  const handleAccept = (meeting) => {
    setMeetingToAccept(meeting)
    setShowAcceptModal(true)
  }

  const handleReject = (meeting) => {
    setMeetingToReject(meeting)
    setShowRejectModal(true)
  }

  const confirmAccept = async () => {
    if (!meetingToAccept) return

    try {
      const result = await AcceptMeeting(meetingToAccept.id, token)
      
      if (result.success) {
        showToast('Solicitud aceptada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al aceptar la solicitud', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }

    setShowAcceptModal(false)
    setMeetingToAccept(null)
  }

  const confirmReject = async () => {
    if (!meetingToReject) return

    try {
      const result = await RejectMeeting(meetingToReject.id, token)
      
      if (result.success) {
        showToast('Solicitud rechazada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al rechazar la solicitud', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }

    setShowRejectModal(false)
    setMeetingToReject(null)
  }

  return (
    <Container className="view-received-meetings">
      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar por cliente..."
          />
        </Col>
      </Row>

      <Row>
        {filtered.length === 0 ? (
          <Col>
            <p className="text-center">
              {meetings.length === 0 ? 'No hay solicitudes pendientes' : 'No se encontraron solicitudes con esos términos'}
            </p>
          </Col>
        ) : (
          filtered.map(meeting => {
            const customer = getCustomerInfo(meeting.customerId)
            
            return (
              <Col md={6} key={meeting.id} className="mb-4">
                <Card className="card card-meeting">
                  <Card.Img
                    variant="left"
                    src={customer?.imageURL || '/images/NoImage.webp'}
                    alt="Foto cliente"
                    className="card-img"
                  />
                  <Card.Body className="card-body">
                    <div className="card-header-section">
                      <Card.Title className="card-title">
                        {customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente no encontrado'}
                        <span className="meeting-status-badge ms-2">
                          Pendiente
                        </span>
                      </Card.Title>
                      <div className="customer-details">
                        {customer?.city && <span className="customer-location">{customer.city}</span>}
                        {customer?.phoneNumber && <span className="customer-phone"> - {customer.phoneNumber}</span>}
                      </div>
                    </div>
                    
                    <Card.Text className="card-text">
                      <strong>Fecha:</strong> {formatDateTime(meeting.meetingDate)}<br />
                      <strong>Descripción:</strong> {meeting.jobInfo || 'Sin descripción'}
                    </Card.Text>
                    
                    <div className="card-btn-container">
                      <Button 
                        variant="danger" 
                        className="btn-reject"
                        onClick={() => handleReject(meeting)}
                      >
                        Rechazar
                      </Button>
                      <Button 
                        variant="success" 
                        className="btn-accept"
                        onClick={() => handleAccept(meeting)}
                      >
                        Aceptar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })
        )}
      </Row>

      {/* Modal de confirmación para aceptar solicitud */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar aceptación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés aceptar la solicitud de{' '}
            <strong>
              {meetingToAccept && getCustomerInfo(meetingToAccept.customerId) ? 
                `${getCustomerInfo(meetingToAccept.customerId).firstName} ${getCustomerInfo(meetingToAccept.customerId).lastName}` : 
                'este cliente'}
            </strong>?
          </p>
          <p className="text-info">
            <small>Al aceptar, te comprometes a realizar el trabajo en la fecha y hora pactada.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={confirmAccept}>
            Sí, aceptar solicitud
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para rechazar solicitud */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar rechazo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés rechazar la solicitud de{' '}
            <strong>
              {meetingToReject && getCustomerInfo(meetingToReject.customerId) ? 
                `${getCustomerInfo(meetingToReject.customerId).firstName} ${getCustomerInfo(meetingToReject.customerId).lastName}` : 
                'este cliente'}
            </strong>?
          </p>
          <p className="text-warning">
            <small>Esta acción no se puede deshacer.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Sí, rechazar solicitud
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ViewReceivedMeetings