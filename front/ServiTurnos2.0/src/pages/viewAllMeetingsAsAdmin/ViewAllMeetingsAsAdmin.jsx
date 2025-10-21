import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Button, Modal, Form } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './ViewAllMeetingsAsAdmin.css'
import '../../components/navbar/Navbar.css'

const PROFESSION_MAP = {
  0: "Gasista", 1: "Electricista", 2: "Plomero", 
  3: "Carpintero", 4: "Albañil", 5: "Refrigeración"
}

const STATUS_CONFIG = {
  pending: { index: 0, label: 'Pendientes' },
  accepted: { index: 1, label: 'Aceptadas' },
  rejected: { index: 2, label: 'Rechazadas' },
  finalized: { index: 3, label: 'Finalizadas' },
  cancelled: { index: 4, label: 'Canceladas' }
}

const TIME_SLOTS = (() => {
  const slots = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 18 && minute === 30) break
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  return slots
})()

const ViewAllMeetingsAsAdmin = () => {
  const [query, setQuery] = useState('')
  const [meetings, setMeetings] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [meetingsCounts, setMeetingsCounts] = useState({
    pending: 0, accepted: 0, rejected: 0, finalized: 0, cancelled: 0
  })
  const [modals, setModals] = useState({
    delete: { show: false, meeting: null },
    stop: { show: false, meeting: null },
    edit: { show: false, meeting: null }
  })
  const [editData, setEditData] = useState({ date: '', time: '', jobInfo: '' })
  const [originalEditData, setOriginalEditData] = useState({ date: '', time: '', jobInfo: '' })

  const { token } = useAuth()
  const { GetAllMeetingsByStatus, HardDeleteMeeting, SoftDeleteMeeting, UpdateMeeting } = useMeetings()
  const { GetAllProfessionals, GetAllCustomers } = useUsers()
  const { showToast } = useToast()

  const fetchMeetingsByStatus = async (status) => {
    try {
      const meetingsRes = await GetAllMeetingsByStatus(status, token)
      if (meetingsRes.success) {
        setMeetings(meetingsRes.data)
        setFiltered(meetingsRes.data)
      } else {
        showToast('Error al cargar las meetings', 'error')
        setMeetings([])
        setFiltered([])
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
      setMeetings([])
      setFiltered([])
    }
  }

  const fetchAllCounts = async () => {
    try {
      const [professionalsRes, customersRes] = await Promise.all([
        GetAllProfessionals(token),
        GetAllCustomers(token)
      ])

      if (professionalsRes.success && customersRes.success) {
        setProfessionals(professionalsRes.data)
        setCustomers(customersRes.data)
      }

      const counts = {}
      for (let status = 0; status <= 4; status++) {
        try {
          const result = await GetAllMeetingsByStatus(status, token)
          const statusKey = Object.keys(STATUS_CONFIG)[status]
          counts[statusKey] = result.success ? result.data.length : 0
        } catch (error) {
          const statusKey = Object.keys(STATUS_CONFIG)[status]
          counts[statusKey] = 0
        }
      }
      setMeetingsCounts(counts)
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  useEffect(() => { fetchAllCounts() }, [token])
  useEffect(() => { fetchMeetingsByStatus(STATUS_CONFIG[activeTab].index) }, [activeTab, token])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (!value.trim()) {
      setFiltered(meetings)
      return
    }

    const q = value.toLowerCase()
    const results = meetings.filter(meeting => {
      const professional = getProfessionalInfo(meeting.professionalId)
      const customer = getCustomerInfo(meeting.customerId)
      return (
        (professional && (
          professional.firstName?.toLowerCase().includes(q) ||
          professional.lastName?.toLowerCase().includes(q) ||
          PROFESSION_MAP[professional.profession]?.toLowerCase().includes(q)
        )) ||
        (customer && (
          customer.firstName?.toLowerCase().includes(q) ||
          customer.lastName?.toLowerCase().includes(q)
        ))
      )
    })
    setFiltered(results)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setQuery('')
  }

  const getProfessionalInfo = (id) => professionals.find(prof => prof.id === id)
  const getCustomerInfo = (id) => customers.find(customer => customer.id === id)

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

  const getEmptyMessage = () => `No se encuentran meetings ${STATUS_CONFIG[activeTab].label.toLowerCase()}`

  const openModal = (type, meeting = null) => {
    setModals(prev => ({ ...prev, [type]: { show: true, meeting } }))
    
    if (type === 'edit' && meeting) {
      const meetingDate = new Date(meeting.meetingDate)
      const initialData = {
        date: meetingDate.toISOString().split('T')[0],
        time: meetingDate.toTimeString().slice(0, 5),
        jobInfo: meeting.jobInfo || ''
      }
      setEditData(initialData)
      setOriginalEditData(initialData)
    }
  }

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: { show: false, meeting: null } }))
    if (type === 'edit') {
      setEditData({ date: '', time: '', jobInfo: '' })
      setOriginalEditData({ date: '', time: '', jobInfo: '' })
    }
  }

  const confirmHardDelete = async () => {
    const meeting = modals.delete.meeting
    if (!meeting) return
    
    try {
      const result = await HardDeleteMeeting(meeting.id, token)
      if (result.success) {
        showToast('Meeting eliminada permanentemente', 'success')
        await fetchMeetingsByStatus(STATUS_CONFIG[activeTab].index)
        await fetchAllCounts()
      } else {
        showToast(result.msg || 'Error al eliminar la meeting', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    } finally {
      closeModal('delete')
    }
  }

  const confirmSoftDelete = async () => {
    const meeting = modals.stop.meeting
    if (!meeting) return
    
    try {
      const result = await SoftDeleteMeeting(meeting.id, token)
      if (result.success) {
        const action = meeting.available ? 'detenida' : 'restablecida'
        showToast(`Meeting ${action} correctamente`, 'success')
        await fetchMeetingsByStatus(STATUS_CONFIG[activeTab].index)
        await fetchAllCounts()
      } else {
        const action = meeting.available ? 'detener' : 'reestablecer'
        showToast(result.msg || `Error al ${action} la meeting`, 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    } finally {
      closeModal('stop')
    }
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'jobInfo' && value.length > 500) return
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateMeeting = async () => {
    if (!editData.date || !editData.time || !editData.jobInfo.trim()) {
      showToast('Por favor complete todos los campos', 'error')
      return
    }

    if (editData.jobInfo.trim().length > 500) {
      showToast('La descripción no puede exceder los 500 caracteres', 'error')
      return
    }

    const hasChanges = (
      editData.date !== originalEditData.date ||
      editData.time !== originalEditData.time ||
      editData.jobInfo.trim() !== originalEditData.jobInfo.trim()
    )

    if (!hasChanges) {
      showToast('No se registraron cambios.', 'info')
      closeModal('edit')
      return
    }

    const updateData = {
      customerId: modals.edit.meeting.customerId,
      professionalId: modals.edit.meeting.professionalId,
      meetingDate: `${editData.date}T${editData.time}:00.000Z`,
      jobInfo: editData.jobInfo.trim()
    }

    try {
      const result = await UpdateMeeting(modals.edit.meeting.id, updateData, token)
      if (result.success) {
        showToast('Meeting actualizada correctamente', 'success')
        await fetchMeetingsByStatus(STATUS_CONFIG[activeTab].index)
        closeModal('edit')
      } else {
        showToast(result.msg || 'Error al actualizar la meeting', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
  }

  const getMinDate = () => new Date().toISOString().split('T')[0]

  const renderTabButton = (key, config) => (
    <div 
      key={key}
      className={`buttons ${activeTab === key ? 'active' : ''}`}
      onClick={() => handleTabChange(key)}
      style={{ flex: 1, cursor: 'pointer' }}
    >
      {config.label} ({meetingsCounts[key]})
    </div>
  )

  const renderMeetingCard = (meeting) => {
    const professional = getProfessionalInfo(meeting.professionalId)
    const customer = getCustomerInfo(meeting.customerId)
    const canEdit = meeting.status === 0 || meeting.status === 1
    const canStop = meeting.status === 0 || meeting.status === 1
    
    return (
      <Col md={6} key={meeting.id} className="mb-4">
        <Card className={`admin-meeting-card ${meeting.available ? 'available' : 'unavailable'}`}>
          <div className="meeting-images">
            <Card.Img
              src={customer?.imageURL || '/images/NoImage.webp'}
              alt="Foto cliente"
              className="meeting-avatar"
            />
            <Card.Img
              src={professional?.imageURL || '/images/NoImage.webp'}
              alt="Foto profesional"
              className="meeting-avatar"
            />
          </div>
          <Card.Body className="p-0 d-flex flex-column justify-content-between">
            <div className="mb-3">
              <Card.Title className="meeting-title">
                <div className="participant-info mb-2">
                  <strong>Cliente:</strong> 
                  <span className={customer?.available === false ? 'banned-user' : ''}>
                    {customer ? ` ${customer.firstName} ${customer.lastName}` : ' Cliente no encontrado'}
                  </span>
                </div>
                <div className="participant-info">
                  <strong>Profesional:</strong> 
                  <span className={professional?.available === false ? 'banned-user' : ''}>
                    {professional ? ` ${professional.firstName} ${professional.lastName}` : ' Profesional no encontrado'}
                  </span>
                  <span className="profession-badge ms-2">
                    {professional ? PROFESSION_MAP[professional.profession] || 'No especificada' : '-'}
                  </span>
                </div>
              </Card.Title>
            </div>
            
            <Card.Text className="flex-grow-1 lh-base mb-3">
              <strong>Fecha:</strong> {formatDateTime(meeting.meetingDate)}<br />
              <strong>Descripción:</strong> {meeting.jobInfo || 'Sin descripción'}
            </Card.Text>
            
            <div className="d-flex justify-content-end gap-2 mt-auto">
              {canEdit && (
                <Button 
                  variant={meeting.available ? "info" : "success"}
                  size="sm"
                  onClick={() => openModal('stop', meeting)}
                  className="btn-action-admin"
                >
                  {meeting.available ? 'Detener' : 'Reestablecer'}
                </Button>
              )}
              {canStop && (
                <Button 
                  variant="warning"
                  size="sm"
                  onClick={() => openModal('edit', meeting)}
                  className="btn-action-admin"
                >
                  Modificar
                </Button>
                
              )}
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => openModal('delete', meeting)}
                className="btn-action-admin"
              >
                Eliminar
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    )
  }

  const renderConfirmationModal = (type, title, confirmText, confirmVariant, onConfirm) => {
    const meeting = modals[type].meeting
    const customerName = meeting && getCustomerInfo(meeting.customerId) 
      ? `${getCustomerInfo(meeting.customerId).firstName} ${getCustomerInfo(meeting.customerId).lastName}`
      : 'Cliente desconocido'
    const professionalName = meeting && getProfessionalInfo(meeting.professionalId)
      ? `${getProfessionalInfo(meeting.professionalId).firstName} ${getProfessionalInfo(meeting.professionalId).lastName}`
      : 'Profesional desconocido'

    return (
      <Modal show={modals[type].show} onHide={() => closeModal(type)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que quieres {type === 'delete' ? 'eliminar permanentemente' : 
            (meeting?.available ? 'detener' : 'reestablecer')} esta meeting entre{' '}
            <strong>{customerName}</strong> y <strong>{professionalName}</strong>?
          </p>
          <p className={type === 'delete' ? 'text-danger' : meeting?.available ? 'text-warning' : 'text-success'}>
            <small>
              {type === 'delete' ? 'Esta acción no se puede deshacer.' :
               meeting?.available ? 'La meeting será marcada como no disponible.' : 
               'La meeting será marcada como disponible nuevamente.'}
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
    <Container className="admin-meetings-container mt-4">
      <Row className="justify-content-center mb-3">
        <Col md={12}>
          <div className="d-flex gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => renderTabButton(key, config))}
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={6}>
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar por profesional o cliente..."
          />
        </Col>
      </Row>

      <Row>
        {filtered.length === 0 ? (
          <Col>
            <p className="text-center">{getEmptyMessage()}</p>
          </Col>
        ) : (
          filtered.map(renderMeetingCard)
        )}
      </Row>

      {renderConfirmationModal('delete', 'Confirmar eliminación', 'Sí, eliminar', 'danger', confirmHardDelete)}
      
      {renderConfirmationModal(
        'stop', 
        modals.stop.meeting?.available ? 'Confirmar detención' : 'Confirmar restablecimiento',
        modals.stop.meeting?.available ? 'Sí, detener' : 'Sí, reestablecer',
        modals.stop.meeting?.available ? 'warning' : 'success',
        confirmSoftDelete
      )}

      <Modal show={modals.edit.show} onHide={() => closeModal('edit')} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modals.edit.meeting && (
            <div className="mb-3">
              <h6>
                {getCustomerInfo(modals.edit.meeting.customerId)?.firstName} {getCustomerInfo(modals.edit.meeting.customerId)?.lastName}
                {' y '}
                {getProfessionalInfo(modals.edit.meeting.professionalId)?.firstName} {getProfessionalInfo(modals.edit.meeting.professionalId)?.lastName}
              </h6>
              <p className="text-muted">
                {getProfessionalInfo(modals.edit.meeting.professionalId) 
                  ? PROFESSION_MAP[getProfessionalInfo(modals.edit.meeting.professionalId).profession] 
                  : 'Profesión desconocida'
                }
              </p>
            </div>
          )}
          
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={editData.date}
                    onChange={handleEditInputChange}
                    min={getMinDate()}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora</Form.Label>
                  <Form.Select
                    name="time"
                    value={editData.time}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Descripción del trabajo</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="jobInfo"
                value={editData.jobInfo}
                onChange={handleEditInputChange}
                placeholder="Describa brevemente el trabajo a realizar..."
                maxLength={500}
                required
              />
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">Máximo 500 caracteres</small>
                <small className={`${editData.jobInfo.length > 400 ? 'text-warning' : 'text-muted'} ${editData.jobInfo.length >= 500 ? 'text-danger' : ''}`}>
                  {editData.jobInfo.length}/500
                </small>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => closeModal('edit')}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateMeeting}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ViewAllMeetingsAsAdmin