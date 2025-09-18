import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal, Form, Button as BSButton } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useAuth } from '../../services/authentication/AuthContext'
import { useMeetings } from '../../services/meetingsContext/MeetingsContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './searchProfessionals.css'

const PROFESSION_MAP = {
  0: "Gasista",
  1: "Electricista", 
  2: "Plomero",
  3: "Carpintero",
  4: "Albañil",
  5: "Refrigeración"
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

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

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

const isCustomerComplete = (customer) => {
  return customer?.imageURL && customer?.city && customer?.phoneNumber
}

const SearchProfessionals = () => {
  const [query, setQuery] = useState('')
  const [professionals, setProfessionals] = useState([])
  const [filteredProfessionals, setFilteredProfessionals] = useState([])
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

  const getActiveProfessionals = (profs) => {
    return profs.filter(prof => 
      isProfessionalComplete(prof) && 
      !prof.isDeleted && 
      prof.available !== 0 && 
      prof.available !== false
    )
  }

  const searchProfessionals = (searchValue, profs) => {
    if (!searchValue.trim()) return profs
    
    const q = searchValue.toLowerCase()
    return profs.filter(prof =>
      prof.firstName?.toLowerCase().includes(q) ||
      prof.lastName?.toLowerCase().includes(q) ||
      PROFESSION_MAP[prof.profession]?.toLowerCase().includes(q) ||
      prof.city?.toLowerCase().includes(q)
    )
  }

  const sortProfessionals = (profs, ascending = true) => {
    return [...profs].sort((a, b) => ascending ? a.fee - b.fee : b.fee - a.fee)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return

      const [customerRes, professionalsRes] = await Promise.all([
        GetCustomerById(userId, token),
        GetAllProfessionals(token)
      ])

      if (customerRes.success) setCustomer(customerRes.data)
      
      if (professionalsRes.success) {
        const activeProfessionals = getActiveProfessionals(professionalsRes.data)
        setProfessionals(activeProfessionals)
        setFilteredProfessionals(activeProfessionals)
      }
    }
    fetchData()
  }, [userId, token, GetCustomerById, GetAllProfessionals])

  const handleSearch = (value) => {
    setQuery(value)
    setFilteredProfessionals(searchProfessionals(value, professionals))
  }

  const handleSort = (ascending) => {
    setFilteredProfessionals(sortProfessionals(filteredProfessionals, ascending))
  }

  const handleRequestMeeting = (professional) => {
    setSelectedProfessional(professional)
    setMeetingData({ date: '', time: '', jobInfo: '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProfessional(null)
    setMeetingData({ date: '', time: '', jobInfo: '' })
  }

  const handleMeetingDataChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'jobInfo' && value.length > 200) return
    
    setMeetingData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitMeeting = async () => {
    const { date, time, jobInfo } = meetingData
    
    if (!date || !time || !jobInfo.trim()) {
      showToast('Por favor complete todos los campos', 'error')
      return
    }

    const meetingDateTime = `${date}T${time}:00.000Z`
    const requestData = {
      customerId: userId,
      professionalId: selectedProfessional.id,
      meetingDate: meetingDateTime,
      jobInfo: jobInfo.trim()
    }

    try {
      const result = await AddMeeting(requestData, token)
      
      if (result.success) {
        showToast('Solicitud de turno enviada exitosamente', 'success')
        closeModal()
      } else {
        showToast(result.msg || 'Error al enviar la solicitud', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
  }

  const getMinDate = () => new Date().toISOString().split('T')[0]

  const renderProfessionalCard = (prof) => (
    <Col md={6} key={prof.id} className="mb-4">
      <Card className="professional-card">
        <div className="d-flex align-items-center p-3">
          <img
            src={prof.imageURL || '/images/NoImage.webp'}
            alt="Foto perfil"
            className="professional-avatar me-3"
          />
          <div className="flex-grow-1">
            <Card.Title className="professional-title mb-2">
              {prof.firstName} {prof.lastName}
            </Card.Title>
            <div className="professional-info mb-3">
              <div><strong>Profesión:</strong> {PROFESSION_MAP[prof.profession] || 'Desconocido'}</div>
              <div><strong>Ciudad:</strong> {prof.city}</div>
              <div><strong>Tarifa:</strong> ${prof.fee}</div>
              <div><strong>Disponibilidad:</strong> {prof.availability}</div>
            </div>
            <div className="d-flex justify-content-end">
              <Button 
                variant="success" 
                className="request-btn"
                onClick={() => handleRequestMeeting(prof)}
              >
                Solicitar turno
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  )

  if (!isCustomerComplete(customer)) {
    return (
      <Container className="search-container">
        <Row className="justify-content-center">
          <Col md={8} className="text-center mt-5">
            <h4>Por favor actualice su perfil para poder realizar esta acción.</h4>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container className="search-container">
      {/* Buscador y controles */}
      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Nombre, profesión, ciudad..."
          />
        </Col>
        <Col md="auto" className="d-flex gap-2">
          <Button 
            variant="primary"            
            onClick={() => handleSort(true)}            
            title="Ordenar precio: menor a mayor"
            style={{ height: '38px' }}
          >
            Tarifa ↓
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSort(false)}
            title="Ordenar precio: mayor a menor"
            style={{ height: '38px' }}
          >
            Tarifa ↑
          </Button>
        </Col>
      </Row>

      {/* Lista de profesionales */}
      <Row>
        {filteredProfessionals.length === 0 ? (
          <Col xs={12}>
            <div className="text-center mt-5">
              <p>No se encontraron profesionales.</p>
            </div>
          </Col>
        ) : (
          filteredProfessionals.map(renderProfessionalCard)
        )}
      </Row>

      {/* Modal para solicitar turno */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar Turno</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProfessional && (
            <div className="mb-3">
              <h6>{selectedProfessional.firstName} {selectedProfessional.lastName}</h6>
              <p className="text-muted">
                {PROFESSION_MAP[selectedProfessional.profession]} - ${selectedProfessional.fee}
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
                    value={meetingData.date}
                    onChange={handleMeetingDataChange}
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
                    onChange={handleMeetingDataChange}
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
                value={meetingData.jobInfo}
                onChange={handleMeetingDataChange}
                placeholder="Describa brevemente el trabajo a realizar..."
                maxLength={200}
                required
              />
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">Máximo 200 caracteres</small>
                <small className={`${meetingData.jobInfo.length > 150 ? 'text-warning' : 'text-muted'} ${meetingData.jobInfo.length >= 200 ? 'text-danger' : ''}`}>
                  {meetingData.jobInfo.length}/200
                </small>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <BSButton variant="secondary" onClick={closeModal}>
            Cancelar
          </BSButton>
          <BSButton variant="primary" onClick={handleSubmitMeeting}>
            Enviar Solicitud
          </BSButton>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default SearchProfessionals