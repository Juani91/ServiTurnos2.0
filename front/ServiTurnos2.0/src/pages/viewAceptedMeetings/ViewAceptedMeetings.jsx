import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './ViewAceptedMeetings.css'

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const ViewAceptedMeetings = () => {
  const [query, setQuery] = useState('')
  const [meetings, setMeetings] = useState([])
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [meetingToCancel, setMeetingToCancel] = useState(null)
  const [meetingToFinalize, setMeetingToFinalize] = useState(null)

  const { token } = useAuth()
  const { GetAcceptedMeetings, CancelMeeting, FinalizeMeeting } = useMeetings()
  const { GetAllCustomers } = useUsers()
  const { showToast } = useToast()

  // Obtener el ID del profesional del token
  const decoded = token ? parseJwt(token) : null
  const professionalId = decoded?.Id

  const fetchMeetings = async () => {
    if (!professionalId) return

    const [meetingsRes, customersRes] = await Promise.all([
      GetAcceptedMeetings(professionalId, token),
      GetAllCustomers(token)
    ])

    if (meetingsRes.success && customersRes.success) {
      setMeetings(meetingsRes.data)
      setCustomers(customersRes.data)
      setFiltered(meetingsRes.data)
    } else {
      showToast('Error al cargar las citas aceptadas', 'error')
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
    const results = meetings.filter(meeting => {
      const customer = getCustomerInfo(meeting.customerId)
      return customer && (
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

  const handleCancel = (meeting) => {
    setMeetingToCancel(meeting)
    setShowCancelModal(true)
  }

  const handleFinalize = (meeting) => {
    setMeetingToFinalize(meeting)
    setShowFinalizeModal(true)
  }

  const confirmCancel = async () => {
    if (!meetingToCancel) return

    try {
      const result = await CancelMeeting(meetingToCancel.id, token)
      
      if (result.success) {
        showToast('Cita cancelada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al cancelar la cita', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }

    setShowCancelModal(false)
    setMeetingToCancel(null)
  }

  const confirmFinalize = async () => {
    if (!meetingToFinalize) return

    try {
      const result = await FinalizeMeeting(meetingToFinalize.id, token)
      
      if (result.success) {
        showToast('Cita finalizada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al finalizar la cita', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }

    setShowFinalizeModal(false)
    setMeetingToFinalize(null)
  }

  return (
    <Container className="view-accepted-meetings">
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
              {meetings.length === 0 ? 'No hay citas aceptadas' : 'No se encontraron citas con esos términos'}
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
                          Aceptada
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
                        className="btn-cancel"
                        onClick={() => handleCancel(meeting)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        variant="success" 
                        className="btn-finalize"
                        onClick={() => handleFinalize(meeting)}
                      >
                        Finalizar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })
        )}
      </Row>

      {/* Modal de confirmación para cancelar cita */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar cancelación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés cancelar la cita con{' '}
            <strong>
              {meetingToCancel && getCustomerInfo(meetingToCancel.customerId) ? 
                `${getCustomerInfo(meetingToCancel.customerId).firstName} ${getCustomerInfo(meetingToCancel.customerId).lastName}` : 
                'este cliente'}
            </strong>?
          </p>
          <p className="text-warning">
            <small>Esta acción no se puede deshacer.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, mantener cita
          </Button>
          <Button variant="danger" onClick={confirmCancel}>
            Sí, cancelar cita
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para finalizar cita */}
      <Modal show={showFinalizeModal} onHide={() => setShowFinalizeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar finalización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés finalizar la cita con{' '}
            <strong>
              {meetingToFinalize && getCustomerInfo(meetingToFinalize.customerId) ? 
                `${getCustomerInfo(meetingToFinalize.customerId).firstName} ${getCustomerInfo(meetingToFinalize.customerId).lastName}` : 
                'este cliente'}
            </strong>?
          </p>
          <p className="text-info">
            <small>Al finalizar, confirmas que el trabajo ha sido completado satisfactoriamente.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFinalizeModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={confirmFinalize}>
            Sí, finalizar cita
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ViewAceptedMeetings