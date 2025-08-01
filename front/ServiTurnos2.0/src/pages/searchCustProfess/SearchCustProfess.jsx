import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal, Form } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useAuth } from '../../services/authentication/AuthContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './SearchCustProfess.css'
import '../../components/navbar/Navbar.css'

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [activeTab, setActiveTab] = useState('active') // 'active' o 'blocked'
  const { GetAllCustomers, GetAllProfessionals, UpdateCustomer, UpdateProfessional, SoftDeleteCustomer, SoftDeleteProfessional, HardDeleteCustomer, HardDeleteProfessional } = useUsers()
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
        
        // Filtrar según la pestaña activa
        filterUsersByStatus(combinedUsers, activeTab)
      }
    }
    fetchData()
  }, [GetAllCustomers, GetAllProfessionals, token])

  useEffect(() => {
    if (allUsers.length > 0) {
      filterUsersByStatus(allUsers, activeTab)
    }
  }, [activeTab, allUsers])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (!value.trim()) {
      filterUsersByStatus(allUsers, activeTab)
      return
    }

    const q = value.toLowerCase()
    
    // Filtrar por estado (bloqueado/activo) y luego por nombre
    const usersByStatus = allUsers.filter(user => {
      const isBlocked = user.isDeleted || user.available === 0 || user.available === false
      return activeTab === 'active' ? !isBlocked : isBlocked
    })
    
    const results = usersByStatus.filter(user =>
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q)
    )
    setFiltered(results)
  }

  const filterUsersByStatus = (users, status) => {
    const filteredUsers = users.filter(user => {
      const isBlocked = user.isDeleted || user.available === 0 || user.available === false
      return status === 'active' ? !isBlocked : isBlocked
    })
    setFiltered(filteredUsers)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setQuery('') // Limpiar búsqueda al cambiar de pestaña
    filterUsersByStatus(allUsers, tab)
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
      
      // Filtrar según la pestaña activa
      filterUsersByStatus(combinedUsers, activeTab)
    }
  }

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDelete = async (user) => {
    try {
      let result
      
      if (user.userType === 'professional') {
        result = await SoftDeleteProfessional(user.id, token)
      } else {
        result = await SoftDeleteCustomer(user.id, token)
      }

      if (result.success) {
        showToast(`${user.userType === 'professional' ? 'Profesional' : 'Cliente'} bloqueado exitosamente!`, 'success')
        // Recargar los datos para mostrar los cambios
        await fetchData()
      } else {
        showToast(result.msg || 'Error al bloquear usuario', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
  }

  const handleHardDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmHardDelete = async () => {
    if (!userToDelete) return
    
    try {
      let result
      
      if (userToDelete.userType === 'professional') {
        result = await HardDeleteProfessional(userToDelete.id, token)
      } else {
        result = await HardDeleteCustomer(userToDelete.id, token)
      }

      if (result.success) {
        showToast(`${userToDelete.userType === 'professional' ? 'Profesional' : 'Cliente'} eliminado permanentemente!`, 'success')
        // Recargar los datos para mostrar los cambios
        await fetchData()
      } else {
        showToast(result.msg || 'Error al eliminar usuario', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    } finally {
      setShowDeleteModal(false)
      setUserToDelete(null)
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  return (
    <Container className="search-cust-profess">
      {/* Pestañas para cambiar entre usuarios activos y bloqueados */}
      <Row className="justify-content-center mb-3">
        <Col md={8}>
          <div className="d-flex gap-2">
            <div 
              className={`buttons ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => handleTabChange('active')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Usuarios Activos ({allUsers.filter(u => !u.isDeleted && u.available !== 0 && u.available !== false).length})
            </div>
            <div 
              className={`buttons ${activeTab === 'blocked' ? 'active' : ''}`}
              onClick={() => handleTabChange('blocked')}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              Usuarios Bloqueados ({allUsers.filter(u => u.isDeleted || u.available === 0 || u.available === false).length})
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
                    {activeTab === 'blocked' && (
                      <Button 
                        variant="dark" 
                        className="btn-hard-delete"
                        onClick={() => handleHardDelete(user)}
                      >
                        Eliminar
                      </Button>
                    )}
                    <Button 
                      variant="warning" 
                      className="btn-modify"
                      onClick={() => handleModify(user)}
                    >
                      Modificar
                    </Button>
                    <Button 
                      variant="danger" 
                      className="btn-delete"
                      onClick={() => handleDelete(user)}
                    >
                      {activeTab === 'active' ? 'Bloquear' : 'Desbloquear'}
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

      {/* Modal de confirmación para eliminar usuario */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que querés eliminar permanentemente a{' '}
            <strong>
              {userToDelete?.firstName} {userToDelete?.lastName}
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
    </Container>
  )
}

export default SearchCustProfess