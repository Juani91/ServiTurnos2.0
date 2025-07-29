import { useEffect, useState } from 'react'
import { Card, Row, Col, Container } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useAuth } from '../../services/authentication/AuthContext'
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
  const { GetAllProfessionals, GetCustomerById } = useUsers()
  const { token } = useAuth()

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
        // Filtrar solo profesionales con perfil completo
        const completeProfessionals = res.data.filter(isProfessionalComplete)
        setProfessionals(completeProfessionals)
        setFiltered(completeProfessionals)
      }
    }
    fetchProfessionals()
  }, [GetAllProfessionals, token])

  const handleInputChange = (e) => {
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
            onChange={handleInputChange}
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
              <Card className="card">
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
                    <Button variant="success" className="btn-success">
                      Solicitar turno
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  )
}

export default SearchProfessionals