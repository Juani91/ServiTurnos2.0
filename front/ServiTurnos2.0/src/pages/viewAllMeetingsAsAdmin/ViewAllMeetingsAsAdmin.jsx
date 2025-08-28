import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Button, Modal, Form } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './ViewAllMeetingsAsAdmin.css'
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

const ViewAllMeetingsAsAdmin = () => {
  const [query, setQuery] = useState('')
  const [meetings, setMeetings] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [meetingsCounts, setMeetingsCounts] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    finalized: 0,
    cancelled: 0
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStopModal, setShowStopModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [meetingToDelete, setMeetingToDelete] = useState(null)
  const [meetingToStop, setMeetingToStop] = useState(null)
  const [meetingToEdit, setMeetingToEdit] = useState(null)
  const [editData, setEditData] = useState({
    date: '',
    time: '',
    jobInfo: ''
  })
  const [originalEditData, setOriginalEditData] = useState({
    date: '',
    time: '',
    jobInfo: ''
  })

  const { token } = useAuth()
  const { GetAllMeetingsByStatus, HardDeleteMeeting, SoftDeleteMeeting, UpdateMeeting } = useMeetings()
  const { GetAllProfessionals, GetAllCustomers } = useUsers()
  const { showToast } = useToast()

  const fetchMeetingsByStatus = async (status) => {
    try {
      const meetingsRes = await GetAllMeetingsByStatus(status, token)

      if (meetingsRes.success) {
        // NO filtrar por available - mostrar todas las meetings
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

  // Función para obtener todos los conteos
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

      // Obtener conteos para cada estado (TODAS las meetings, no solo available)
      const counts = {}
      
      for (let status = 0; status <= 4; status++) {
        try {
          const result = await GetAllMeetingsByStatus(status, token)
          if (result.success) {
            const statusKey = ['pending', 'accepted', 'rejected', 'finalized', 'cancelled'][status]
            counts[statusKey] = result.data.length // Contar todas, no solo available
          }
        } catch (error) {
          const statusKey = ['pending', 'accepted', 'rejected', 'finalized', 'cancelled'][status]
          counts[statusKey] = 0
        }
      }

      setMeetingsCounts(counts)
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  // Cargar conteos al inicio
  useEffect(() => {
    fetchAllCounts()
  }, [token])

  // Cargar meetings del tab activo
  useEffect(() => {
    const statusMap = {
      'pending': 0,
      'accepted': 1,
      'rejected': 2,
      'finalized': 3,
      'cancelled': 4
    }
    fetchMeetingsByStatus(statusMap[activeTab])
  }, [activeTab, token])

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
          professionMap[professional.profession]?.toLowerCase().includes(q)
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

  const getProfessionalInfo = (professionalId) => {
    return professionals.find(prof => prof.id === professionalId)
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

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'pending':
        return 'No se encuentran meetings pendientes'
      case 'accepted':
        return 'No se encuentran meetings aceptadas'
      case 'rejected':
        return 'No se encuentran meetings rechazadas'
      case 'finalized':
        return 'No se encuentran meetings finalizadas'
      case 'cancelled':
        return 'No se encuentran meetings canceladas'
      default:
        return 'No se encontraron meetings'
    }
  }

  const handleHardDeleteClick = (meeting) => {
    setMeetingToDelete(meeting)
    setShowDeleteModal(true)
  }

  const handleSoftDeleteClick = (meeting) => {
    setMeetingToStop(meeting)
    setShowStopModal(true)
  }

  const confirmHardDelete = async () => {
    if (!meetingToDelete) return
    
    try {
      const result = await HardDeleteMeeting(meetingToDelete.id, token)
      
      if (result.success) {
        showToast('Meeting eliminada permanentemente', 'success')
        // Recargar las meetings del tab actual
        const statusMap = {
          'pending': 0,
          'accepted': 1,
          'rejected': 2,
          'finalized': 3,
          'cancelled': 4
        }
        await fetchMeetingsByStatus(statusMap[activeTab])
        // Recargar los conteos
        await fetchAllCounts()
      } else {
        showToast(result.msg || 'Error al eliminar la meeting', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    } finally {
      setShowDeleteModal(false)
      setMeetingToDelete(null)
    }
  }

  const confirmSoftDelete = async () => {
    if (!meetingToStop) return
    
    try {
      const result = await SoftDeleteMeeting(meetingToStop.id, token)
      
      if (result.success) {
        const action = meetingToStop.available ? 'detenida' : 'restablecida'
        showToast(`Meeting ${action} correctamente`, 'success')
        // Recargar las meetings del tab actual
        const statusMap = {
          'pending': 0,
          'accepted': 1,
          'rejected': 2,
          'finalized': 3,
          'cancelled': 4
        }
        await fetchMeetingsByStatus(statusMap[activeTab])
        // Recargar los conteos
        await fetchAllCounts()
      } else {
        const action = meetingToStop.available ? 'detener' : 'reestablecer'
        showToast(result.msg || `Error al ${action} la meeting`, 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    } finally {
      setShowStopModal(false)
      setMeetingToStop(null)
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setMeetingToDelete(null)
  }

  const handleCloseStopModal = () => {
    setShowStopModal(false)
    setMeetingToStop(null)
  }

  const handleEditClick = (meeting) => {
    setMeetingToEdit(meeting)
    
    // Extraer fecha y hora del meetingDate
    const meetingDate = new Date(meeting.meetingDate)
    const dateStr = meetingDate.toISOString().split('T')[0]
    const timeStr = meetingDate.toTimeString().slice(0, 5)
    
    const initialData = {
      date: dateStr,
      time: timeStr,
      jobInfo: meeting.jobInfo || ''
    }
    
    setEditData(initialData)
    setOriginalEditData(initialData) // Guardar los datos originales
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setMeetingToEdit(null)
    setEditData({ date: '', time: '', jobInfo: '' })
    setOriginalEditData({ date: '', time: '', jobInfo: '' })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    
    // Límite de caracteres para jobInfo
    if (name === 'jobInfo' && value.length > 500) {
      return
    }
    
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
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

    // Verificar si hubo cambios comparando con los datos originales
    const hasChanges = (
      editData.date !== originalEditData.date ||
      editData.time !== originalEditData.time ||
      editData.jobInfo.trim() !== originalEditData.jobInfo.trim()
    )

    if (!hasChanges) {
      showToast('No se registraron cambios.', 'info')
      handleCloseEditModal()
      return
    }

    // Formar la fecha en formato ISO
    const meetingDateTime = `${editData.date}T${editData.time}:00.000Z`

    const updateData = {
      customerId: meetingToEdit.customerId,
      professionalId: meetingToEdit.professionalId,
      meetingDate: meetingDateTime,
      jobInfo: editData.jobInfo.trim()
    }

    try {
      const result = await UpdateMeeting(meetingToEdit.id, updateData, token)
      
      if (result.success) {
        showToast('Meeting actualizada correctamente', 'success')
        // Recargar las meetings del tab actual
        const statusMap = {
          'pending': 0,
          'accepted': 1,
          'rejected': 2,
          'finalized': 3,
          'cancelled': 4
        }
        await fetchMeetingsByStatus(statusMap[activeTab])
        handleCloseEditModal()
      } else {
        showToast(result.msg || 'Error al actualizar la meeting', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
  }

  // Generate time options (every 30 minutes from 8:00 to 18:00)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 18 && minute === 30) break // Stop at 18:00
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeStr)
      }
    }
    return options
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <Container className="view-all-meetings-admin">
      {/* Pestañas para cambiar entre estados de meetings */}
      <Row className="justify-content-center mb-3">
        <Col md={12}>
          <div className="d-flex gap-2">
            <div 
              className={`buttons ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => handleTabChange('pending')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Pendientes ({meetingsCounts.pending})
            </div>
            <div 
              className={`buttons ${activeTab === 'accepted' ? 'active' : ''}`}
              onClick={() => handleTabChange('accepted')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Aceptadas ({meetingsCounts.accepted})
            </div>
            <div 
              className={`buttons ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => handleTabChange('rejected')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Rechazadas ({meetingsCounts.rejected})
            </div>
            <div 
              className={`buttons ${activeTab === 'finalized' ? 'active' : ''}`}
              onClick={() => handleTabChange('finalized')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Finalizadas ({meetingsCounts.finalized})
            </div>
            <div 
              className={`buttons ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => handleTabChange('cancelled')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Canceladas ({meetingsCounts.cancelled})
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
            placeholder="Buscar por profesional o cliente..."
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
            const customer = getCustomerInfo(meeting.customerId)
            
            return (
              <Col md={6} key={meeting.id} className="mb-4">
                <Card className={`card ${meeting.available ? 'card-meeting-available' : 'card-meeting-unavailable'}`}>
                  <div className="card-images-container">
                    <Card.Img
                      src={customer?.imageURL || '/images/NoImage.webp'}
                      alt="Foto cliente"
                      className="card-img customer-img"
                    />
                    <Card.Img
                      src={professional?.imageURL || '/images/NoImage.webp'}
                      alt="Foto profesional"
                      className="card-img professional-img"
                    />
                  </div>
                  <Card.Body className="card-body">
                    <Card.Title className="card-title">
                      <div className="names-container">
                        <div className="customer-info">
                          <strong>Cliente:</strong> 
                          <span className={customer && customer.available === false ? 'banned-user' : ''}>
                            {customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente no encontrado'}
                          </span>
                        </div>
                        <div className="professional-info">
                          <strong>Profesional:</strong> 
                          <span className={professional && professional.available === false ? 'banned-user' : ''}>
                            {professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional no encontrado'}
                          </span>
                          <span className="profession-badge ms-2">
                            {professional ? professionMap[professional.profession] || 'No especificada' : '-'}
                          </span>
                        </div>
                      </div>
                    </Card.Title>
                    <Card.Text className="card-text">
                      <strong>Fecha:</strong> {formatDateTime(meeting.meetingDate)}<br />
                      <strong>Descripción:</strong> {meeting.jobInfo || 'Sin descripción'}
                    </Card.Text>
                    <div className="card-actions">
                      {/* Botón Editar solo para Pendientes (0) o Aceptadas (1) */}
                      {(meeting.status === 0 || meeting.status === 1) && (
                        <Button 
                          variant="info"
                          size="sm"
                          onClick={() => handleEditClick(meeting)}
                          className="edit-button me-2"
                        >
                          Editar
                        </Button>
                      )}
                      {/* Solo mostrar botón Detener/Reestablecer para meetings Pendientes (0) o Aceptadas (1) */}
                      {(meeting.status === 0 || meeting.status === 1) && (
                        <Button 
                          variant={meeting.available ? "warning" : "success"}
                          size="sm"
                          onClick={() => handleSoftDeleteClick(meeting)}
                          className={`${meeting.available ? 'stop-button' : 'restore-button'} me-2`}
                        >
                          {meeting.available ? 'Detener' : 'Reestablecer'}
                        </Button>
                      )}
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleHardDeleteClick(meeting)}
                        className="delete-button"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })
        )}
      </Row>

      {/* Modal de confirmación para eliminar meeting */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés eliminar permanentemente esta meeting entre{' '}
            <strong>
              {meetingToDelete && getCustomerInfo(meetingToDelete.customerId) 
                ? `${getCustomerInfo(meetingToDelete.customerId).firstName} ${getCustomerInfo(meetingToDelete.customerId).lastName}`
                : 'Cliente desconocido'
              }
            </strong>
            {' y '}
            <strong>
              {meetingToDelete && getProfessionalInfo(meetingToDelete.professionalId)
                ? `${getProfessionalInfo(meetingToDelete.professionalId).firstName} ${getProfessionalInfo(meetingToDelete.professionalId).lastName}`
                : 'Profesional desconocido'
              }
            </strong>?
          </p>
          <p className="text-danger">
            <small>Esta acción no se puede deshacer.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmHardDelete}>
            Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para detener/reestablecer meeting */}
      <Modal show={showStopModal} onHide={handleCloseStopModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {meetingToStop?.available ? 'Confirmar detención' : 'Confirmar restablecimiento'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés {meetingToStop?.available ? 'detener' : 'reestablecer'} esta meeting entre{' '}
            <strong>
              {meetingToStop && getCustomerInfo(meetingToStop.customerId) 
                ? `${getCustomerInfo(meetingToStop.customerId).firstName} ${getCustomerInfo(meetingToStop.customerId).lastName}`
                : 'Cliente desconocido'
              }
            </strong>
            {' y '}
            <strong>
              {meetingToStop && getProfessionalInfo(meetingToStop.professionalId)
                ? `${getProfessionalInfo(meetingToStop.professionalId).firstName} ${getProfessionalInfo(meetingToStop.professionalId).lastName}`
                : 'Profesional desconocido'
              }
            </strong>?
          </p>
          <p className={meetingToStop?.available ? "text-warning" : "text-success"}>
            <small>
              {meetingToStop?.available 
                ? 'La meeting será marcada como no disponible.' 
                : 'La meeting será marcada como disponible nuevamente.'
              }
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStopModal}>
            Cancelar
          </Button>
          <Button 
            variant={meetingToStop?.available ? "warning" : "success"} 
            onClick={confirmSoftDelete}
          >
            {meetingToStop?.available ? 'Sí, detener' : 'Sí, reestablecer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar meeting */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {meetingToEdit && (
            <div className="mb-3">
              <h6>
                {getCustomerInfo(meetingToEdit.customerId)?.firstName} {getCustomerInfo(meetingToEdit.customerId)?.lastName}
                {' y '}
                {getProfessionalInfo(meetingToEdit.professionalId)?.firstName} {getProfessionalInfo(meetingToEdit.professionalId)?.lastName}
              </h6>
              <p className="text-muted">
                {getProfessionalInfo(meetingToEdit.professionalId) 
                  ? professionMap[getProfessionalInfo(meetingToEdit.professionalId).profession] 
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
                    {generateTimeOptions().map(time => (
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
                <small className="text-muted">
                  Máximo 500 caracteres
                </small>
                <small className={`${editData.jobInfo.length > 400 ? 'text-warning' : 'text-muted'} ${editData.jobInfo.length >= 500 ? 'text-danger' : ''}`}>
                  {editData.jobInfo.length}/500
                </small>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
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