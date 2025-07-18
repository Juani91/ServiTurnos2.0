import { useEffect, useState } from 'react'
import { Card, Row, Col, Container } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useAuth } from '../../services/authentication/AuthContext'
import './searchProfessionals.css'

const SearchProfessionals = () => {
  const [query, setQuery] = useState('')
  const [professionals, setProfessionals] = useState([])
  const [filtered, setFiltered] = useState([])
  const { GetAllProfessionals } = useUsers()
  const { token } = useAuth()

  const professionMap = {
    0: "Gasista",
    1: "Electricista",
    2: "Plomero",
    3: "Carpintero",
    4: "Albañil",
    5: "Refrigeración"
  }

  useEffect(() => {
    const fetchProfessionals = async () => {
      const res = await GetAllProfessionals(token)
      if (res.success) {
        setProfessionals(res.data)
        setFiltered(res.data)
      }
    }
    fetchProfessionals()
  }, [GetAllProfessionals, token])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    const q = value.toLowerCase()
    const results = professionals.filter(
      prof =>
        (prof.firstName && prof.firstName.toLowerCase().includes(q)) ||
        (prof.lastName && prof.lastName.toLowerCase().includes(q)) ||
        (typeof prof.profession === 'number' && professionMap[prof.profession].toLowerCase().includes(q)) ||
        (prof.city && prof.city.toLowerCase().includes(q))
    )
    setFiltered(results)
  }

  return (
    <Container className="search-professionals">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="search-input-margin">
            <Input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Nombre, profesión, ciudad..."
            />
          </div>
        </Col>
      </Row>
      <Row>
        {filtered.length === 0 ? (
          <Col>
            <p>No se encontraron profesionales.</p>
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