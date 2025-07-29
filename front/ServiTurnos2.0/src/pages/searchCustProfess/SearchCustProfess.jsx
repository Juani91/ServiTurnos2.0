import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal, Form } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useAuth } from '../../services/authentication/AuthContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './SearchCustProfess.css'

const professionMap = {
  0: "Gasista",
  1: "Electricista", 
  2: "Plomero",
  3: "Carpintero",
  4: "Albañil",
  5: "Refrigeración"
}

const SearchCustProfess = () => {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  const { GetAllCustomers, GetAllProfessionals, UpdateCustomer, UpdateProfessional } = useUsers()
  const { token } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const [customersRes, professionalsRes] = await Promise.all([
        GetAllCustomers(token),
        GetAllProfessionals(token)
      ])

      if (customersRes.success && professionalsRes.success) {
        // Agregar tipo de usuario a cada objeto
        const customersWithType = customersRes.data.map(customer => ({
          ...customer,
          userType: 'customer'
        }))
        
        const professionalsWithType = professionalsRes.data.map(professional => ({
          ...professional,
          userType: 'professional'
        }))

        // Combinar ambas listas y ordenar alfabéticamente por apellido
        const combinedUsers = [...customersWithType, ...professionalsWithType]
          .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''))
        
        setCustomers(customersRes.data)
        setProfessionals(professionalsRes.data)
        setAllUsers(combinedUsers)
        setFiltered(combinedUsers)
      }
    }
    fetchData()
  }, [GetAllCustomers, GetAllProfessionals, token])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (!value.trim()) {
      setFiltered(allUsers)
      return
    }

    const q = value.toLowerCase()
    
    // Filtrar todos los usuarios solo por nombre
    const results = allUsers.filter(user =>
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q)
    )
    setFiltered(results)
  }

  const handleModify = (user) => {
    setSelectedUser(user)
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      city: user.city || '',
      phoneNumber: user.phoneNumber || '',
      ...(user.userType === 'professional' && {
        profession: user.profession || 0,
        fee: user.fee || '',
        availability: user.availability || ''
      })
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUser(null)
    setEditForm({})
  }

  const handleSaveChanges = async () => {
    if (!selectedUser) return
    
    // Detectar si hay cambios
    const originalData = {
      firstName: selectedUser.firstName || '',
      lastName: selectedUser.lastName || '',
      city: selectedUser.city || '',
      phoneNumber: selectedUser.phoneNumber || '',
      ...(selectedUser.userType === 'professional' && {
        profession: selectedUser.profession || 0,
        fee: selectedUser.fee || '',
        availability: selectedUser.availability || ''
      })
    }

    const hasChanges = Object.keys(editForm).some(key => {
      return editForm[key] !== originalData[key]
    })

    if (!hasChanges) {
      showToast('No se encontraron modificaciones', 'info')
      handleCloseModal()
      return
    }

    try {
      let result
      
      if (selectedUser.userType === 'professional') {
        result = await UpdateProfessional(selectedUser.id, editForm, token)
      } else {
        result = await UpdateCustomer(selectedUser.id, editForm, token)
      }

      if (result.success) {
        showToast('Usuario modificado exitosamente!', 'success')
        handleCloseModal()
        // Recargar los datos para mostrar los cambios
        await fetchData()
      } else {
        showToast(result.msg || 'Error al modificar usuario', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
  }

  const fetchData = async () => {
    const [customersRes, professionalsRes] = await Promise.all([
      GetAllCustomers(token),
      GetAllProfessionals(token)
    ])

    if (customersRes.success && professionalsRes.success) {
      // Agregar tipo de usuario a cada objeto
      const customersWithType = customersRes.data.map(customer => ({
        ...customer,
        userType: 'customer'
      }))
      
      const professionalsWithType = professionalsRes.data.map(professional => ({
        ...professional,
        userType: 'professional'
      }))

      // Combinar ambas listas y ordenar alfabéticamente por apellido
      const combinedUsers = [...customersWithType, ...professionalsWithType]
        .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''))
      
      setCustomers(customersRes.data)
      setProfessionals(professionalsRes.data)
      setAllUsers(combinedUsers)
      setFiltered(combinedUsers)
    }
  }

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDelete = (user) => {
    console.log(`Eliminar ${user.userType}:`, user)
    // Aquí implementarás la lógica de eliminar
  }

  return (
    <Container className="search-cust-profess">
      <Row className="justify-content-center">
        <Col md={6}>
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar por nombre..."
          />
        </Col>
      </Row>

      <Row>
        {filtered.length === 0 ? (
          <Col>
            <p className="text-center">
              No se encontraron usuarios.
            </p>
          </Col>
        ) : (
          filtered.map(user => (
            <Col md={6} key={`${user.userType}-${user.id}`} className="mb-4">
              <Card className={`card ${user.userType === 'professional' ? 'card-professional' : 'card-customer'}`}>
                <Card.Img
                  variant="left"
                  src={user.imageURL || '/images/NoImage.webp'}
                  alt="Foto perfil"
                  className="card-img"
                />
                <Card.Body className="card-body">
                  <Card.Title className="card-title">
                    {user.firstName} {user.lastName}
                    <span className="user-type-badge ms-2">
                      {user.userType === 'professional' ? 'Profesional' : 'Cliente'}
                    </span>
                  </Card.Title>
                  <Card.Text className="card-text">
                    {user.userType === 'professional' ? (
                      <>
                        <strong>Profesión:</strong> {professionMap[user.profession] !== undefined ? professionMap[user.profession] : '-'}<br />
                        <strong>Ciudad:</strong> {user.city || '-'}<br />
                        <strong>Tarifa:</strong> {user.fee ? `$${user.fee}` : '-'}<br />
                        <strong>Disponibilidad:</strong> {user.availability || '-'}
                      </>
                    ) : (
                      <>
                        <strong>Ciudad:</strong> {user.city || '-'}<br />
                        <span className="invisible-field"><strong>&nbsp;</strong></span><br />
                        <span className="invisible-field"><strong>&nbsp;</strong></span><br />
                        <span className="invisible-field"><strong>&nbsp;</strong></span>
                      </>
                    )}
                  </Card.Text>
                  <div className="card-btn-container">
                    <Button 
                      variant="warning" 
                      className="btn-modify me-2"
                      onClick={() => handleModify(user)}
                    >
                      Modificar
                    </Button>
                    <Button 
                      variant="danger" 
                      className="btn-delete"
                      onClick={() => handleDelete(user)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal para editar usuario */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Modificar {selectedUser?.userType === 'professional' ? 'Profesional' : 'Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.firstName || ''}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.lastName || ''}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.phoneNumber || ''}
                    onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {selectedUser?.userType === 'professional' && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Profesión</Form.Label>
                      <Form.Select
                        value={editForm.profession || 0}
                        onChange={(e) => handleFormChange('profession', parseInt(e.target.value))}
                      >
                        <option value={0}>Gasista</option>
                        <option value={1}>Electricista</option>
                        <option value={2}>Plomero</option>
                        <option value={3}>Carpintero</option>
                        <option value={4}>Albañil</option>
                        <option value={5}>Refrigeración</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tarifa</Form.Label>
                      <Form.Control
                        type="number"
                        value={editForm.fee || ''}
                        onChange={(e) => handleFormChange('fee', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Disponibilidad</Form.Label>
                      <Form.Control
                        type="text"
                        value={editForm.availability || ''}
                        onChange={(e) => handleFormChange('availability', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default SearchCustProfess