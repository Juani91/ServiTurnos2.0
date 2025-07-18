import { useState, useEffect } from 'react'
import { useAuth } from "../../services/authentication/AuthContext"
import { Form, Container, Row, Col, Modal } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useUsers } from "../../services/usersContext/UsersContext";
import { useToast } from "../../context/toastContext/ToastContext";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const Profile = () => {
  const { token } = useAuth()
  const decoded = token ? parseJwt(token) : null
  const userType = decoded?.UserType
  const userId = decoded?.Id
  const { showToast } = useToast();

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

  const [originalData, setOriginalData] = useState(null);
  const [editing, setEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const professionMap = {
    0: "Gasista",
    1: "Electricista",
    2: "Plomero",
    3: "Carpintero",
    4: "Albañil",
    5: "Refrigeración"
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleEdit = () => setEditing((prev) => !prev)

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageURL: reader.result }));
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setShowModal(false)
    showToast('Cuenta eliminada (simulado)', 'info')
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userType || !userId) return

      const endpoint = `https://localhost:7286/api/${userType}/${userId}`

      try {
        const response = await fetch(endpoint, {
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
        setFormData((prev) => ({ ...prev, ...data }))
        setOriginalData(data);
      } catch (error) {
        console.error('Error de red:', error)
      }
    }

    fetchProfile()
  }, [token, userType, userId])

  const { UpdateAdmin, UpdateCustomer, UpdateProfessional } = useUsers();

  const handleSave = async () => {
    if (JSON.stringify(formData) === JSON.stringify(originalData)) {
      showToast("No se detectaron cambios.", "info");
      setEditing(false);
      return;
    }

    let result;
    if (userType === 'Admin') {
      result = await UpdateAdmin(userId, formData, token);
    } else if (userType === 'Customer') {
      result = await UpdateCustomer(userId, formData, token);
    } else if (userType === 'Professional') {
      result = await UpdateProfessional(userId, formData, token);
    }

    if (result?.success) {
      showToast('Perfil modificado exitosamente!', 'success');
      setEditing(false);
      setOriginalData(formData);
    } else {
      showToast(`Error al guardar: ${result?.msg}`, 'error');
    }
  };

  return (
    <Container
      style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        padding: '3rem'
      }}
    >
      <Row
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8rem'
        }}
      >
        <Col md={4} style={{ width: '200px', textAlign: 'center' }}>
          <img
            src={formData.imageURL || '/images/NoImage.webp'}
            alt="Perfil"
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginTop:
                userType === 'Professional'
                  ? '20%'
                  : userType === 'Customer'
                  ? '10%'
                  : '0%'
            }}
          />
          {editing && (
            <Form.Group style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Button
                variant="secondary"
                onClick={() => document.getElementById('hiddenFileInput').click()}
              >
                Seleccionar archivo
              </Button>
              <input
                type="file"
                id="hiddenFileInput"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </Form.Group>
          )}
        </Col>

        <Col md={8} style={{ width: '700px' }}>
          <Form>
            <Row>
              <Col md={6}>
                <Input
                  label="Nombre"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Col>
              <Col md={6}>
                <Input
                  label="Apellido"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Col>
            </Row>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editing}
            />

            {(userType === 'Customer' || userType === 'Professional') && (
              <Row>
                <Col md={6}>
                  <Input
                    label="Teléfono"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Col>
                <Col md={6}>
                  <Input
                    label="Ciudad"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Col>
              </Row>
            )}

            {userType === 'Professional' && (
              <>
                <Form.Group style={{ marginBottom: '1rem' }}>
                  <Form.Label style={{ fontWeight: 'bold' }}>Profesión</Form.Label>
                  {editing ? (
                    <Form.Select
                      name="profession"
                      value={formData.profession}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          profession: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {Object.entries(professionMap).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <div
                      className="form-control"
                      style={{ backgroundColor: '#E9ECEF' }}
                    >
                      {professionMap[formData.profession] || 'Desconocido'}
                    </div>
                  )}
                </Form.Group>

                <Input
                  label="Tarifa"
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  disabled={!editing}
                />
                <Input
                  label="Disponibilidad"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant={editing ? 'success' : 'primary'}
                onClick={editing ? handleSave : toggleEdit}
                style={{ marginRight: '0.5rem' }}
              >
                {editing ? 'Guardar cambios' : 'Modificar'}
              </Button>
              <Button variant="danger" onClick={() => setShowModal(true)}>
                Borrar cuenta
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro que querés eliminar esta cuenta?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Profile
