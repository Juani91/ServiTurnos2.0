import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './ViewAceptedMeetings.css'

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
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

  const decoded = token ? parseJwt(token) : null
  const professionalId = decoded?.Id

  const fetchMeetings = async () => {
    if (!professionalId) return

    const [meetingsRes, customersRes] = await Promise.all([
      GetAcceptedMeetings(professionalId, token),
      GetAllCustomers(token)
    ])

    if (meetingsRes.success && customersRes.success) {
      const availableMeetings = meetingsRes.data.filter(meeting => meeting.available === true)
      setMeetings(availableMeetings)
      setCustomers(customersRes.data)
      setFiltered(availableMeetings)
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
      return meeting.available === true && customer && (
        customer.firstName?.toLowerCase().includes(q) ||
        customer.lastName?.toLowerCase().includes(q)
      )
    })
    setFiltered(results)
  }

  const getCustomerInfo = (customerId) => customers.find(customer => customer.id === customerId)

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada'
    
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    const formattedTime = date.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    })
    
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

  const renderMeetingCard = (meeting) => {
    const customer = getCustomerInfo(meeting.customerId)
    
    return (
      <Col md={6} key={meeting.id} className="mb-4">
        <Card className="meeting-card">
          <Card.Img
            variant="left"
            src={customer?.imageURL || '/images/NoImage.webp'}
            alt="Foto cliente"
            className="meeting-avatar"
          />
          <Card.Body className="p-0 d-flex flex-column justify-content-between">
            <div className="mb-3">
              <Card.Title className="meeting-title">
                {customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente no encontrado'}
                <span className="meeting-status-badge ms-2">Aceptada</span>
              </Card.Title>
              {customer && (
                <div className="customer-details">
                  {customer.city && <span className="fw-semibold">{customer.city}</span>}
                  {customer.phoneNumber && <span> - {customer.phoneNumber}</span>}
                </div>
              )}
            </div>
            
            <Card.Text className="flex-grow-1 lh-base">
              <strong>Fecha:</strong> {formatDateTime(meeting.meetingDate)}<br />
              <strong>Descripción:</strong> {meeting.jobInfo || 'Sin descripción'}
            </Card.Text>
            
            <div className="d-flex justify-content-end gap-2 mt-auto">
              <Button 
                variant="danger" 
                className="btn-action"
                onClick={() => handleCancel(meeting)}
              >
                Cancelar
              </Button>
              <Button 
                variant="success" 
                className="btn-action"
                onClick={() => handleFinalize(meeting)}
              >
                Finalizar
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    )
  }

  const renderConfirmationModal = (show, onHide, title, message, confirmText, confirmVariant, onConfirm, warning) => (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {warning && <p className={`text-${warning.type}`}><small>{warning.text}</small></p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {title.includes('cancelación') ? 'No, mantener cita' : 'Cancelar'}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )

  const getCancelModalMessage = () => {
    const customerName = meetingToCancel && getCustomerInfo(meetingToCancel.customerId) 
      ? `${getCustomerInfo(meetingToCancel.customerId).firstName} ${getCustomerInfo(meetingToCancel.customerId).lastName}` 
      : 'este cliente'
    return `¿Estás seguro que querés cancelar la cita con ${customerName}?`
  }

  const getFinalizeModalMessage = () => {
    const customerName = meetingToFinalize && getCustomerInfo(meetingToFinalize.customerId) 
      ? `${getCustomerInfo(meetingToFinalize.customerId).firstName} ${getCustomerInfo(meetingToFinalize.customerId).lastName}` 
      : 'este cliente'
    return `¿Estás seguro que querés finalizar la cita con ${customerName}?`
  }

  return (
    <Container className="accepted-meetings-container mt-4">
      <Row className="justify-content-center">
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
          filtered.map(renderMeetingCard)
        )}
      </Row>

      {renderConfirmationModal(
        showCancelModal,
        () => setShowCancelModal(false),
        'Confirmar cancelación',
        getCancelModalMessage(),
        'Sí, cancelar cita',
        'danger',
        confirmCancel,
        { type: 'warning', text: 'Esta acción no se puede deshacer.' }
      )}

      {renderConfirmationModal(
        showFinalizeModal,
        () => setShowFinalizeModal(false),
        'Confirmar finalización',
        getFinalizeModalMessage(),
        'Sí, finalizar cita',
        'success',
        confirmFinalize,
        { type: 'info', text: 'Al finalizar, confirmas que el trabajo ha sido completado satisfactoriamente.' }
      )}
    </Container>
  )
}

export default ViewAceptedMeetings