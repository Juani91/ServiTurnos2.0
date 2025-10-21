import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './ViewReceivedMeetings.css'

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const ViewReceivedMeetings = () => {
  const [query, setQuery] = useState('')
  const [meetings, setMeetings] = useState([])
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [modals, setModals] = useState({
    accept: { show: false, meeting: null },
    reject: { show: false, meeting: null }
  })

  const { token } = useAuth()
  const { GetPendingMeetings, AcceptMeeting, RejectMeeting } = useMeetings()
  const { GetAllCustomers } = useUsers()
  const { showToast } = useToast()

  const decoded = token ? parseJwt(token) : null
  const professionalId = decoded?.Id

  const fetchMeetings = async () => {
    if (!professionalId) return

    const [meetingsRes, customersRes] = await Promise.all([
      GetPendingMeetings(professionalId, token),
      GetAllCustomers(token)
    ])

    if (meetingsRes.success && customersRes.success) {
      const availableMeetings = meetingsRes.data.filter(meeting => meeting.available === true)
      
      // Ordenar las solicitudes por fecha y hora (de menor a mayor)
      const sortedMeetings = availableMeetings.sort((a, b) => {
        const dateA = new Date(a.meetingDate)
        const dateB = new Date(b.meetingDate)
        return dateA - dateB
      })
      
      setMeetings(sortedMeetings)
      setCustomers(customersRes.data)
      setFiltered(sortedMeetings)
    } else {
      showToast('Error al cargar las solicitudes', 'error')
    }
  }

  useEffect(() => { fetchMeetings() }, [professionalId, token])

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
    
    // Mantener el orden por fecha después del filtrado
    const sortedResults = results.sort((a, b) => {
      const dateA = new Date(a.meetingDate)
      const dateB = new Date(b.meetingDate)
      return dateA - dateB
    })
    
    setFiltered(sortedResults)
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

  const openModal = (type, meeting) => {
    setModals(prev => ({ ...prev, [type]: { show: true, meeting } }))
  }

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: { show: false, meeting: null } }))
  }

  const confirmAccept = async () => {
    const meeting = modals.accept.meeting
    if (!meeting) return

    try {
      const result = await AcceptMeeting(meeting.id, token)
      if (result.success) {
        showToast('Solicitud aceptada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al aceptar la solicitud', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
    closeModal('accept')
  }

  const confirmReject = async () => {
    const meeting = modals.reject.meeting
    if (!meeting) return

    try {
      const result = await RejectMeeting(meeting.id, token)
      if (result.success) {
        showToast('Solicitud rechazada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al rechazar la solicitud', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
    closeModal('reject')
  }

  const renderMeetingCard = (meeting) => {
    const customer = getCustomerInfo(meeting.customerId)
    
    return (
      <Col md={6} key={meeting.id} className="mb-4">
        <Card className="received-meeting-card">
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
                <span className="meeting-status-badge ms-2">Pendiente</span>
              </Card.Title>
              {customer && (
                <div className="customer-details text-muted">
                  {customer.city && <span className="fw-semibold">{customer.city}</span>}
                  {customer.phoneNumber && <span> - {customer.phoneNumber}</span>}
                </div>
              )}
            </div>
            
            <Card.Text className="flex-grow-1 lh-base mb-3">
              <strong>Fecha:</strong> {formatDateTime(meeting.meetingDate)}<br />
              <strong>Descripción:</strong> {meeting.jobInfo || 'Sin descripción'}
            </Card.Text>
            
            <div className="d-flex justify-content-end gap-2 mt-auto">
              <Button 
                variant="danger" 
                className="btn-action"
                onClick={() => openModal('reject', meeting)}
              >
                Rechazar
              </Button>
              <Button 
                variant="success" 
                className="btn-action"
                onClick={() => openModal('accept', meeting)}
              >
                Aceptar
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    )
  }

  const renderConfirmationModal = (type, title, message, confirmText, confirmVariant, onConfirm, warningType = 'info') => {
    const meeting = modals[type].meeting
    const customerName = meeting && getCustomerInfo(meeting.customerId) 
      ? `${getCustomerInfo(meeting.customerId).firstName} ${getCustomerInfo(meeting.customerId).lastName}`
      : 'este cliente'

    return (
      <Modal show={modals[type].show} onHide={() => closeModal(type)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{message.replace('{customerName}', customerName)}</p>
          <p className={`text-${warningType}`}>
            <small>
              {type === 'accept' 
                ? 'Al aceptar, te comprometes a realizar el trabajo en la fecha y hora pactada.'
                : 'Esta acción no se puede deshacer.'
              }
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => closeModal(type)}>
            Cancelar
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <Container className="received-meetings-container mt-4">
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
              {meetings.length === 0 ? 'No hay solicitudes pendientes' : 'No se encontraron solicitudes con esos términos'}
            </p>
          </Col>
        ) : (
          filtered.map(renderMeetingCard)
        )}
      </Row>

      {renderConfirmationModal(
        'accept',
        'Confirmar aceptación',
        '¿Estás seguro de que quieres aceptar la solicitud de {customerName}?',
        'Sí, aceptar solicitud',
        'success',
        confirmAccept,
        'info'
      )}

      {renderConfirmationModal(
        'reject',
        'Confirmar rechazo',
        '¿Estás seguro de que quieres rechazar la solicitud de {customerName}?',
        'Sí, rechazar solicitud',
        'danger',
        confirmReject,
        'warning'
      )}
    </Container>
  )
}

export default ViewReceivedMeetings