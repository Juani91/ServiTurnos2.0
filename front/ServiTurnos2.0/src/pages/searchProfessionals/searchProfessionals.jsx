import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal, Form } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './searchProfessionals.css'

const professionMap = {
  0: "Gasista",
  1: "Electricista", 
  2: "Plomero",
  3: "Carpintero",
  4: "Albañil",
  5: "Refrigeración"
}

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

// Validación para verificar si el profesional tiene el perfil completo
const isProfessionalComplete = (professional) => {
  return professional.imageURL && 
         professional.firstName && 
         professional.lastName && 
         professional.city && 
         professional.phoneNumber && 
         professional.profession !== null && 
         professional.fee !== null && 
         professional.availability
}

const SearchProfessionals = () => {
  const [query, setQuery] = useState('')
  const [professionals, setProfessionals] = useState([])
  const [filtered, setFiltered] = useState([])
  const [customer, setCustomer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [meetingData, setMeetingData] = useState({
    date: '',
    time: '',
    jobInfo: ''
  })
  
  const { GetAllProfessionals, GetCustomerById } = useUsers()
  const { AddMeeting } = useMeetings()
  const { token } = useAuth()
  const { showToast } = useToast()

  const decoded = token ? parseJwt(token) : null
  const userId = decoded?.Id

  useEffect(() => {
    const fetchCustomer = async () => {
      if (userId) {
        const res = await GetCustomerById(userId, token)
        if (res.success) setCustomer(res.data)
      }
    }
    fetchCustomer()
  }, [userId, token, GetCustomerById])

  useEffect(() => {
    const fetchProfessionals = async () => {
      const res = await GetAllProfessionals(token)
      if (res.success) {
        // Filtrar solo profesionales con perfil completo y que no estén bloqueados
        const activeProfessionals = res.data.filter(prof => 
          isProfessionalComplete(prof) && 
          !prof.isDeleted && 
          prof.available !== 0 && 
          prof.available !== false
        )
        setProfessionals(activeProfessionals)
        setFiltered(activeProfessionals)
      }
    }
    fetchProfessionals()
  }, [GetAllProfessionals, token])

  const handleRequestMeeting = (professional) => {
    setSelectedProfessional(professional)
    setShowModal(true)
    setMeetingData({ date: '', time: '', jobInfo: '' })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedProfessional(null)
    setMeetingData({ date: '', time: '', jobInfo: '' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Límite de caracteres para jobInfo
    if (name === 'jobInfo' && value.length > 500) {
      return // No actualizar si excede el límite
    }
    
    setMeetingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitMeeting = async () => {
    // Validaciones
    if (!meetingData.date || !meetingData.time || !meetingData.jobInfo.trim()) {
      showToast('Por favor complete todos los campos', 'error')
      return
    }

    // Validación adicional de longitud
    if (meetingData.jobInfo.trim().length > 500) {
      showToast('La descripción no puede exceder los 500 caracteres', 'error')
      return
    }

    // Formar la fecha en formato ISO
    const meetingDateTime = `${meetingData.date}T${meetingData.time}:00.000Z`

    const requestData = {
      customerId: userId,
      professionalId: selectedProfessional.id,
      meetingDate: meetingDateTime,
      jobInfo: meetingData.jobInfo.trim()
    }

    try {
      const result = await AddMeeting(requestData, token)
      
      if (result.success) {
        showToast('Solicitud de turno enviada exitosamente', 'success')
        handleCloseModal()
      } else {
        showToast(result.msg || 'Error al enviar la solicitud', 'error')
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

  const handleInputChangeSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (!value.trim()) {
      // Solo mostrar profesionales con perfil completo
      setFiltered(professionals)
      return
    }

    const q = value.toLowerCase()
    // Filtrar entre los profesionales que ya tienen perfil completo
    const results = professionals.filter(prof =>
      prof.firstName?.toLowerCase().includes(q) ||
      prof.lastName?.toLowerCase().includes(q) ||
      professionMap[prof.profession]?.toLowerCase().includes(q) ||
      prof.city?.toLowerCase().includes(q)
    )
    setFiltered(results)
  }

  const sortByPriceAsc = () => {
    const sorted = [...filtered].sort((a, b) => a.fee - b.fee)
    setFiltered(sorted)
  }

  const sortByPriceDesc = () => {
    const sorted = [...filtered].sort((a, b) => b.fee - a.fee)
    setFiltered(sorted)
  }

  // Validación de campos obligatorios
  const isCustomerComplete = customer?.imageURL && customer?.city && customer?.phoneNumber

  if (!isCustomerComplete) {
    return (
      <Container className="search-professionals">
        <Row className="justify-content-center">
          <Col md={8} className="text-center mt-5">
            <h4>Por favor actualice su perfil para poder realizar esta acción.</h4>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container className="search-professionals">
      <Row className="justify-content-center">
        <Col md={6}>
          <Input
            type="text"
            value={query}
            onChange={handleInputChangeSearch}
            placeholder="Nombre, profesión, ciudad..."
          />
        </Col>
        <Col md="auto" className="d-flex gap-2">
          
          <Button 
            variant="primary"            
            onClick={sortByPriceAsc}            
            title="Ordenar precio: menor a mayor"
            style={{ height: '38px' }}
          >
            Tarifa ↓
          </Button>
          <Button 
            variant="primary" 
            onClick={sortByPriceDesc}
            title="Ordenar precio: mayor a menor"
            style={{ height: '38px' }}
          >
            Tarifa ↑
          </Button>
        </Col>
      </Row>
      <Row>
        {filtered.length === 0 ? (
          <Col>
            <p className="text-center">No se encontraron profesionales.</p>
          </Col>
        ) : (
          filtered.map(prof => (
            <Col md={6} key={prof.id} className="mb-4">
              <Card className="card card-professional">
                <Card.Img
                  variant="left"
                  src={prof.imageURL || '/images/NoImage.webp'}
                  alt="Foto perfil"
                  className="card-img"
                />
                <Card.Body className="card-body">
                  <Card.Title className="card-title">
                    {prof.firstName} {prof.lastName}
                  </Card.Title>
                  <Card.Text className="card-text">
                    <strong>Profesión:</strong> {professionMap[prof.profession] || 'Desconocido'}<br />
                    <strong>Ciudad:</strong> {prof.city}<br />
                    <strong>Tarifa:</strong> ${prof.fee}<br />
                    <strong>Disponibilidad:</strong> {prof.availability}
                  </Card.Text>
                  <div className="card-btn-container">
                    <Button 
                      variant="success" 
                      className="btn-success"
                      onClick={() => handleRequestMeeting(prof)}
                    >
                      Solicitar turno
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal para solicitar turno */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar Turno</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProfessional && (
            <div className="mb-3">
              <h6>{selectedProfessional.firstName} {selectedProfessional.lastName}</h6>
              <p className="text-muted">{professionMap[selectedProfessional.profession]} - ${selectedProfessional.fee}</p>
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
                    value={meetingData.date}
                    onChange={handleInputChange}
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
                    value={meetingData.time}
                    onChange={handleInputChange}
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
                value={meetingData.jobInfo}
                onChange={handleInputChange}
                placeholder="Describa brevemente el trabajo a realizar..."
                maxLength={200}
                required
              />
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">
                  Máximo 200 caracteres
                </small>
                <small className={`${meetingData.jobInfo.length > 150 ? 'text-warning' : 'text-muted'} ${meetingData.jobInfo.length >= 200 ? 'text-danger' : ''}`}>
                  {meetingData.jobInfo.length}/200
                </small>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmitMeeting}>
            Enviar Solicitud
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default SearchProfessionals