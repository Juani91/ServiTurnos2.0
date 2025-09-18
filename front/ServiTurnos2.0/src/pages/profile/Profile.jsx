import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../services/authentication/AuthContext"
import { Modal, Container, Row, Col, Form, Button as BSButton } from 'react-bootstrap'
import { useUsers } from "../../services/usersContext/UsersContext"
import { useToast } from "../../context/toastContext/ToastContext"
import './Profile.css'

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const PROFESSION_MAP = {
  0: "Gasista",
  1: "Electricista", 
  2: "Plomero",
  3: "Carpintero",
  4: "Albañil",
  5: "Refrigeración"
}

const Profile = () => {
  const navigate = useNavigate()
  const { token, Logout } = useAuth()
  const decoded = token ? parseJwt(token) : null
  const userType = decoded?.UserType
  const userId = decoded?.Id
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    city: '',
    imageURL: '',
    profession: '',
    fee: '',
    availability: '',
  })

  const [originalData, setOriginalData] = useState(null)
  const [editing, setEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const { UpdateAdmin, UpdateCustomer, UpdateProfessional, HardDeleteAdmin, HardDeleteCustomer, HardDeleteProfessional } = useUsers()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfessionChange = (e) => {
    setFormData(prev => ({ ...prev, profession: parseInt(e.target.value, 10) }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageURL: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const toggleEdit = () => setEditing(prev => !prev)

  const handleDelete = async () => {
    setShowModal(false)
    
    try {
      const deleteActions = {
        Admin: () => HardDeleteAdmin(userId, token),
        Customer: () => HardDeleteCustomer(userId, token),
        Professional: () => HardDeleteProfessional(userId, token)
      }

      const result = await deleteActions[userType]?.()

      if (result?.success) {
        showToast('Se acaba de eliminar tu cuenta en ServiTurnos', 'success')
        setTimeout(() => {
          Logout()
          navigate('/login')
        }, 1500)
      } else {
        showToast(`Error al eliminar la cuenta: ${result?.msg}`, 'error')
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error')
    }
  }

  const fetchProfile = async () => {
    if (!token || !userType || !userId) return

    try {
      const response = await fetch(`https://localhost:7286/api/${userType}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Error al obtener perfil:', await response.text())
        return
      }

      const data = await response.json()
      setFormData(data)
      setOriginalData(data)
    } catch (error) {
      console.error('Error de red:', error)
    }
  }

  const handleSave = async () => {
    if (JSON.stringify(formData) === JSON.stringify(originalData)) {
      showToast("No se detectaron cambios.", "info")
      setEditing(false)
      return
    }

    const updateActions = {
      Admin: () => UpdateAdmin(userId, formData, token),
      Customer: () => UpdateCustomer(userId, formData, token),
      Professional: () => UpdateProfessional(userId, formData, token)
    }

    const result = await updateActions[userType]?.()

    if (result?.success) {
      showToast('Perfil modificado exitosamente!', 'success')
      setEditing(false)
      setOriginalData(formData)
    } else {
      showToast(`Error al guardar: ${result?.msg}`, 'error')
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [token, userType, userId])

  const isCustomerOrProfessional = userType === 'Customer' || userType === 'Professional'

  return (
    <Container fluid className="profile-container">
      <Row className="h-100">
        <Col md={4} className="profile-avatar-section d-flex flex-column align-items-center justify-content-center">
          <img
            src={formData.imageURL || '/images/NoImage.webp'}
            alt="Perfil"
            className="profile-avatar mb-3"
          />
          {editing && (
            <>
              <BSButton
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById('hiddenFileInput').click()}
              >
                Cambiar imagen
              </BSButton>
              <Form.Control
                type="file"
                id="hiddenFileInput"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                accept="image/*"
              />
            </>
          )}
        </Col>

        <Col md={8} className="profile-form-section">
          <div className="profile-form-content">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-label">Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="profile-input"
                    />
                  </Form.Group>
                </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="profile-label">Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className="profile-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="profile-label">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={!editing}
                className="profile-input"
              />
            </Form.Group>

            {isCustomerOrProfessional && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-label">Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="profile-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-label">Ciudad</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="profile-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {userType === 'Professional' && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="profile-label">Profesión</Form.Label>
                      {editing ? (
                        <Form.Select
                          name="profession"
                          value={formData.profession || 0}
                          onChange={handleProfessionChange}
                          className="profile-input"
                        >
                          {Object.entries(PROFESSION_MAP).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type="text"
                          value={PROFESSION_MAP[formData.profession] || 'Desconocido'}
                          disabled
                          className="profile-input"
                        />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="profile-label">Tarifa</Form.Label>
                      <Form.Control
                        type="number"
                        name="fee"
                        value={formData.fee || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        className="profile-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="profile-label">Disponibilidad</Form.Label>
                  <Form.Control
                    type="text"
                    name="availability"
                    value={formData.availability || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className="profile-input"
                  />
                </Form.Group>
              </>
            )}

            <div className="profile-buttons mt-4 pt-4 d-flex justify-content-end gap-3">
              <BSButton
                variant={editing ? 'success' : 'primary'}
                onClick={editing ? handleSave : toggleEdit}
              >
                {editing ? 'Guardar cambios' : 'Modificar'}
              </BSButton>
              <BSButton 
                variant="danger" 
                onClick={() => setShowModal(true)}
              >
                Borrar cuenta
              </BSButton>
            </div>
          </Form>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro que querés eliminar esta cuenta?</Modal.Body>
        <Modal.Footer>
          <BSButton 
            variant="secondary" 
            onClick={() => setShowModal(false)}
          >
            No
          </BSButton>
          <BSButton 
            variant="danger" 
            onClick={handleDelete}
          >
            Sí, eliminar
          </BSButton>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Profile
