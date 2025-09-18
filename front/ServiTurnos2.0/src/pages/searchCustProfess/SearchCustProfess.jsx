import { useEffect, useState } from 'react'
import { Card, Row, Col, Container, Modal, Form, Button as BSButton } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from '../../services/usersContext/UsersContext'
import { useAuth } from '../../services/authentication/AuthContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './SearchCustProfess.css'
import '../../components/navbar/Navbar.css'

const PROFESSION_MAP = {
  0: "Gasista",
  1: "Electricista", 
  2: "Plomero",
  3: "Carpintero",
  4: "Albañil",
  5: "Refrigeración"
}

const USER_TYPES = {
  professional: 'Profesional',
  customer: 'Cliente'
}

const SearchCustProfess = () => {
  const [query, setQuery] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [activeTab, setActiveTab] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  const { 
    GetAllCustomers, 
    GetAllProfessionals, 
    UpdateCustomer, 
    UpdateProfessional, 
    SoftDeleteCustomer, 
    SoftDeleteProfessional, 
    HardDeleteCustomer, 
    HardDeleteProfessional 
  } = useUsers()
  const { token } = useAuth()
  const { showToast } = useToast()

  const isUserBlocked = (user) => user.isDeleted || user.available === 0 || user.available === false

  const filterUsersByStatus = (users, status) => {
    return users.filter(user => status === 'active' ? !isUserBlocked(user) : isUserBlocked(user))
  }

  const processUserData = (customers, professionals) => {
    const combinedUsers = [
      ...customers.map(customer => ({ ...customer, userType: 'customer' })),
      ...professionals.map(professional => ({ ...professional, userType: 'professional' }))
    ].sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''))
    
    setAllUsers(combinedUsers)
    setFilteredUsers(filterUsersByStatus(combinedUsers, activeTab))
  }

  const fetchData = async () => {
    const [customersRes, professionalsRes] = await Promise.all([
      GetAllCustomers(token),
      GetAllProfessionals(token)
    ])

    if (customersRes.success && professionalsRes.success) {
      processUserData(customersRes.data, professionalsRes.data)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (allUsers.length > 0) {
      handleSearch(query)
    }
  }, [activeTab, allUsers])

  const handleSearch = (searchValue) => {
    setQuery(searchValue)
    
    const usersByStatus = filterUsersByStatus(allUsers, activeTab)
    
    if (!searchValue.trim()) {
      setFilteredUsers(usersByStatus)
      return
    }

    const q = searchValue.toLowerCase()
    const results = usersByStatus.filter(user =>
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q)
    )
    setFilteredUsers(results)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setQuery('')
    setFilteredUsers(filterUsersByStatus(allUsers, tab))
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

  const closeModal = () => {
    setShowModal(false)
    setSelectedUser(null)
    setEditForm({})
  }

  const handleSaveChanges = async () => {
    if (!selectedUser) return
    
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

    const hasChanges = Object.keys(editForm).some(key => editForm[key] !== originalData[key])

    if (!hasChanges) {
      showToast('No se encontraron modificaciones', 'info')
      closeModal()
      return
    }

    try {
      const updateFunction = selectedUser.userType === 'professional' ? UpdateProfessional : UpdateCustomer
      const result = await updateFunction(selectedUser.id, editForm, token)

      if (result.success) {
        showToast('Usuario modificado exitosamente!', 'success')
        closeModal()
        await fetchData()
      } else {
        showToast(result.msg || 'Error al modificar usuario', 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
  }

  const handleToggleBlock = async (user) => {
    try {
      const isBlocked = isUserBlocked(user)
      const action = isBlocked ? 'Desbloquear' : 'Bloquear'
      const deleteFunction = user.userType === 'professional' ? SoftDeleteProfessional : SoftDeleteCustomer
      const result = await deleteFunction(user.id, token)

      if (result.success) {
        showToast(`${USER_TYPES[user.userType]} ${action.toLowerCase()}ado exitosamente!`, 'success')
        await fetchData()
      } else {
        showToast(result.msg || `Error al ${action.toLowerCase()} usuario`, 'error')
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
      const deleteFunction = userToDelete.userType === 'professional' ? HardDeleteProfessional : HardDeleteCustomer
      const result = await deleteFunction(userToDelete.id, token)

      if (result.success) {
        showToast(`${USER_TYPES[userToDelete.userType]} eliminado permanentemente!`, 'success')
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

  const activeUsers = allUsers.filter(u => !isUserBlocked(u))
  const blockedUsers = allUsers.filter(u => isUserBlocked(u))

  const renderUserCard = (user) => (
    <Col md={6} key={`${user.userType}-${user.id}`} className="mb-4">
      <Card className={`user-card ${user.userType === 'professional' ? 'card-professional' : 'card-customer'}`}>
        <Card.Img
          variant="left"
          src={user.imageURL || '/images/NoImage.webp'}
          alt="Foto perfil"
          className="user-avatar"
        />
        <Card.Body className="user-body">
          <h5 className="user-title">
            {user.firstName} {user.lastName} 
            <span className="user-type-badge">
              {user.userType === 'professional' ? 'PROFESIONAL' : 'CLIENTE'}
            </span>
          </h5>
          
          <Card.Text className="user-info">
            {user.userType === 'professional' ? (
              <>
                <strong>Profesión:</strong> {PROFESSION_MAP[user.profession] || '-'}<br />
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
          <div className="user-actions d-flex justify-content-end gap-2">
            {activeTab === 'blocked' && (
              <Button 
                variant="dark" 
                className="btn-action"
                onClick={() => handleHardDelete(user)}
              >
                Eliminar
              </Button>
            )}
            <Button 
              variant="warning" 
              className="btn-action"
              onClick={() => handleModify(user)}
            >
              Modificar
            </Button>
            <Button 
              variant="danger" 
              className="btn-action"
              onClick={() => handleToggleBlock(user)}
            >
              {activeTab === 'active' ? 'Bloquear' : 'Desbloquear'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  )

  return (
    <Container className="search-container">
      {/* Pestañas */}
      <Row className="justify-content-center mb-3">
        <Col md={8}>
          <div className="tab-container d-flex gap-2">
            <div 
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => handleTabChange('active')}
            >
              Usuarios Activos ({activeUsers.length})
            </div>
            <div 
              className={`tab-button ${activeTab === 'blocked' ? 'active' : ''}`}
              onClick={() => handleTabChange('blocked')}
            >
              Usuarios Bloqueados ({blockedUsers.length})
            </div>
          </div>
        </Col>
      </Row>

      {/* Buscador */}
      <Row className="justify-content-center">
        <Col md={6}>
          <Input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nombre..."
          />
        </Col>
      </Row>

      {/* Lista de usuarios */}
      <Row>
        {filteredUsers.length === 0 ? (
          <Col xs={12}>
            <div className="text-center mt-5">
              <p>No se encontraron usuarios.</p>
            </div>
          </Col>
        ) : (
          filteredUsers.map(renderUserCard)
        )}
      </Row>

      {/* Modal de edición */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Modificar {selectedUser && USER_TYPES[selectedUser.userType]}
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
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.lastName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
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
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.phoneNumber || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
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
                        onChange={(e) => setEditForm(prev => ({ ...prev, profession: parseInt(e.target.value) }))}
                      >
                        {Object.entries(PROFESSION_MAP).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tarifa</Form.Label>
                      <Form.Control
                        type="number"
                        value={editForm.fee || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fee: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Disponibilidad</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.availability || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <BSButton variant="secondary" onClick={closeModal}>
            Cancelar
          </BSButton>
          <BSButton variant="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </BSButton>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
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
          <BSButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </BSButton>
          <BSButton variant="danger" onClick={confirmHardDelete}>
            Sí, eliminar
          </BSButton>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default SearchCustProfess