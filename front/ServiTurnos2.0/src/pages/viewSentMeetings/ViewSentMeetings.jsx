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

const PROFESSION_MAP = {
  0: "Gasista",
  1: "Electricista", 
  2: "Plomero",
  3: "Carpintero",
  4: "Albañil",
  5: "Refrigeración"
}

const STATUS_MAP = {
  0: "Pendiente",
  1: "Aceptada", 
  2: "Rechazada",
  3: "Finalizada",
  4: "Cancelada"
}

const STATUS_CATEGORIES = {
  pending: [0],
  accepted: [1],
  rejected: [2, 3, 4]
}

const EMPTY_MESSAGES = {
  pending: 'No se encuentran meetings pendientes',
  accepted: 'No se encuentran meetings aceptadas',
  rejected: 'No se encuentran meetings rechazadas'
}

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const ViewSentMeetings = () => {
  const [query, setQuery] = useState('')
  const [meetings, setMeetings] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [modals, setModals] = useState({
    cancel: { show: false, meeting: null },
    finalize: { show: false, meeting: null }
  })

  const { token } = useAuth()
  const { GetAllMeetingsByCustomer, CancelMeeting, FinalizeMeeting } = useMeetings()
  const { GetAllProfessionals } = useUsers()
  const { showToast } = useToast()

  const decoded = token ? parseJwt(token) : null
  const customerId = decoded?.Id

  const fetchMeetings = async () => {
    if (!customerId) return

    const [meetingsRes, professionalsRes] = await Promise.all([
      GetAllMeetingsByCustomer(customerId, token),
      GetAllProfessionals(token)
    ])

    if (meetingsRes.success && professionalsRes.success) {
      const availableMeetings = meetingsRes.data.filter(meeting => meeting.available === true)
      setMeetings(availableMeetings)
      setProfessionals(professionalsRes.data)
      filterMeetingsByStatus(availableMeetings, activeTab)
    } else {
      showToast('Error al cargar las meetings', 'error')
    }
  }

  useEffect(() => { fetchMeetings() }, [customerId, token])
  useEffect(() => {
    if (meetings.length > 0) filterMeetingsByStatus(meetings, activeTab)
  }, [activeTab, meetings])

  const getStatusCategory = (status) => {
    for (const [category, statuses] of Object.entries(STATUS_CATEGORIES)) {
      if (statuses.includes(status)) return category
    }
    return 'pending'
  }

  const filterMeetingsByStatus = (allMeetings, status) => {
    const filteredMeetings = allMeetings.filter(meeting => 
      meeting.available === true && getStatusCategory(meeting.status) === status
    )
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
    const meetingsByStatus = meetings.filter(meeting => 
      meeting.available === true && getStatusCategory(meeting.status) === activeTab
    )
    
    const results = meetingsByStatus.filter(meeting => {
      const professional = getProfessionalInfo(meeting.professionalId)
      return professional && (
        professional.firstName?.toLowerCase().includes(q) ||
        professional.lastName?.toLowerCase().includes(q) ||
        PROFESSION_MAP[professional.profession]?.toLowerCase().includes(q)
      )
    })
    setFiltered(results)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setQuery('')
    filterMeetingsByStatus(meetings, tab)
  }

  const getProfessionalInfo = (professionalId) => 
    professionals.find(prof => prof.id === professionalId)

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

  const canFinalizeMeeting = (meetingDate) => {
    if (!meetingDate) return false
    return new Date() >= new Date(meetingDate)
  }

  const openModal = (type, meeting) => {
    if (type === 'finalize' && !canFinalizeMeeting(meeting.meetingDate)) {
      showToast('Solo se puede finalizar la meeting después de la hora pactada', 'warning')
      return
    }
    setModals(prev => ({ ...prev, [type]: { show: true, meeting } }))
  }

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: { show: false, meeting: null } }))
  }

  const confirmCancel = async () => {
    const meeting = modals.cancel.meeting
    if (!meeting) return

    try {
      const result = await CancelMeeting(meeting.id, token)
      if (result.success) {
        showToast('Meeting cancelada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al cancelar la meeting', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
    closeModal('cancel')
  }

  const confirmFinalize = async () => {
    const meeting = modals.finalize.meeting
    if (!meeting) return

    try {
      const result = await FinalizeMeeting(meeting.id, token)
      if (result.success) {
        showToast('Meeting finalizada exitosamente', 'success')
        await fetchMeetings()
      } else {
        showToast(result.msg || 'Error al finalizar la meeting', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
    closeModal('finalize')
  }

  const getTabCounts = () => {
    const availableMeetings = meetings.filter(m => m.available === true)
    return Object.keys(STATUS_CATEGORIES).reduce((acc, category) => {
      acc[category] = availableMeetings.filter(m => getStatusCategory(m.status) === category).length
      return acc
    }, {})
  }

  const renderTabButton = (tab, label, count) => (
    <div 
      key={tab}
      className={`buttons ${activeTab === tab ? 'active' : ''}`}
      onClick={() => handleTabChange(tab)}
      style={{ flex: 1, cursor: 'pointer' }}
    >
      {label} ({count})
    </div>
  )

  const renderActionButtons = (meeting) => {
    const canFinalize = canFinalizeMeeting(meeting.meetingDate)
    
    if (meeting.status === 0) { // Pendiente
      return (
        <Button 
          variant="danger" 
          className="btn-action"
          onClick={() => openModal('cancel', meeting)}
        >
          Cancelar
        </Button>
      )
    }
    
    if (meeting.status === 1) { // Aceptada
      return (
        <>
          <Button 
            variant="danger" 
            className="btn-action"
            onClick={() => openModal('cancel', meeting)}
          >
            Cancelar
          </Button>
          <Button 
            variant="success" 
            className="btn-action"
            onClick={() => openModal('finalize', meeting)}
            disabled={!canFinalize}
            title={!canFinalize ? 'Solo se puede finalizar después de la hora pactada' : 'Finalizar meeting'}
          >
            Finalizar
          </Button>
        </>
      )
    }
    
    return null
  }

  const renderMeetingCard = (meeting) => {
    const professional = getProfessionalInfo(meeting.professionalId)
    
    return (
      <Col md={6} key={meeting.id} className="mb-4">
        <Card className="sent-meeting-card">
          <Card.Img
            variant="left"
            src={professional?.imageURL || '/images/NoImage.webp'}
            alt="Foto profesional"
            className="meeting-avatar"
          />
          <Card.Body className="p-0 d-flex flex-column justify-content-between">
            <div className="mb-3">
              <Card.Title className="meeting-title">
                {professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional no encontrado'}
                <span className="meeting-status-badge ms-2">
                  {STATUS_MAP[meeting.status]}
                </span>
              </Card.Title>
            </div>
            
            <Card.Text className="flex-grow-1 lh-base mb-3">
              <strong>Profesión:</strong> {professional ? PROFESSION_MAP[professional.profession] || 'No especificada' : '-'}<br />
              <strong>Fecha:</strong> {formatDateTime(meeting.meetingDate)}<br />
              <strong>Descripción:</strong> {meeting.jobInfo || 'Sin descripción'}
            </Card.Text>
            
            <div className="d-flex justify-content-end gap-2 mt-auto">
              {renderActionButtons(meeting)}
            </div>
          </Card.Body>
        </Card>
      </Col>
    )
  }

  const renderConfirmationModal = (type, title, message, confirmText, confirmVariant, onConfirm, warningType = 'warning') => {
    const meeting = modals[type].meeting
    const professionalName = meeting && getProfessionalInfo(meeting.professionalId) 
      ? `${getProfessionalInfo(meeting.professionalId).firstName} ${getProfessionalInfo(meeting.professionalId).lastName}`
      : 'este profesional'

    return (
      <Modal show={modals[type].show} onHide={() => closeModal(type)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{message.replace('{professionalName}', professionalName)}</p>
          <p className={`text-${warningType}`}>
            <small>
              {type === 'finalize' 
                ? 'Esto marcará el trabajo como completado.'
                : 'Esta acción no se puede deshacer.'
              }
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => closeModal(type)}>
            {type === 'cancel' ? 'No, mantener' : 'No, mantener'}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const counts = getTabCounts()

  return (
    <Container className="sent-meetings-container mt-4">
      <Row className="justify-content-center mb-3">
        <Col md={10}>
          <div className="d-flex gap-2">
            {renderTabButton('pending', 'Pendientes', counts.pending)}
            {renderTabButton('accepted', 'Aceptadas', counts.accepted)}
            {renderTabButton('rejected', 'Rechazadas', counts.rejected)}
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
              {EMPTY_MESSAGES[activeTab] || 'No se encontraron meetings'}
            </p>
          </Col>
        ) : (
          filtered.map(renderMeetingCard)
        )}
      </Row>

      {renderConfirmationModal(
        'cancel',
        'Confirmar cancelación',
        '¿Estás seguro que querés cancelar esta meeting con {professionalName}?',
        'Sí, cancelar meeting',
        'danger',
        confirmCancel,
        'warning'
      )}

      {renderConfirmationModal(
        'finalize',
        'Confirmar finalización', 
        '¿Estás seguro que querés finalizar esta meeting con {professionalName}?',
        'Sí, finalizar meeting',
        'success',
        confirmFinalize,
        'info'
      )}
    </Container>
  )
}

export default ViewSentMeetings