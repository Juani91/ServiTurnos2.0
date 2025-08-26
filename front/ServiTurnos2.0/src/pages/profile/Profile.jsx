import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../services/authentication/AuthContext"
import { Modal } from 'react-bootstrap'
import Button from '../../components/ui/Button'
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

  const professionMap = {
    0: "Gasista",
    1: "Electricista",
    2: "Plomero",
    3: "Carpintero",
    4: "Albañil",
    5: "Refrigeración"
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleEdit = () => setEditing((prev) => !prev)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageURL: reader.result }))
    }

    if (file) {
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async () => {
    setShowModal(false)
    
    try {
      let result
      
      if (userType === 'Admin') {
        result = await HardDeleteAdmin(userId, token)
      } else if (userType === 'Customer') {
        result = await HardDeleteCustomer(userId, token)
      } else if (userType === 'Professional') {
        result = await HardDeleteProfessional(userId, token)
      }

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
        setFormData(data)
        setOriginalData(data)
      } catch (error) {
        console.error('Error de red:', error)
      }
    }

    fetchProfile()
  }, [token, userType, userId])

  const { UpdateAdmin, UpdateCustomer, UpdateProfessional, HardDeleteAdmin, HardDeleteCustomer, HardDeleteProfessional } = useUsers()

  const handleSave = async () => {
    if (JSON.stringify(formData) === JSON.stringify(originalData)) {
      showToast("No se detectaron cambios.", "info")
      setEditing(false)
      return
    }

    let result
    if (userType === 'Admin') {
      result = await UpdateAdmin(userId, formData, token)
    } else if (userType === 'Customer') {
      result = await UpdateCustomer(userId, formData, token)
    } else if (userType === 'Professional') {
      result = await UpdateProfessional(userId, formData, token)
    }

    if (result?.success) {
      showToast('Perfil modificado exitosamente!', 'success')
      setEditing(false)
      setOriginalData(formData)
    } else {
      showToast(`Error al guardar: ${result?.msg}`, 'error')
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-avatar-section">
        <img
          src={formData.imageURL || '/images/NoImage.webp'}
          alt="Perfil"
          className="profile-avatar"
        />
        {editing && (
          <>
            <button
              className="upload-button"
              onClick={() => document.getElementById('hiddenFileInput').click()}
            >
              Cambiar imagen
            </button>
            <input
              type="file"
              id="hiddenFileInput"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </>
        )}
      </div>

      <div className="profile-form-section">
        <div className="profile-form-content">
          <div className="profile-row">
            <div className="profile-col">
              <div className="profile-field">
                <label>Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
            </div>
            <div className="profile-col">
              <div className="profile-field">
                <label>Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          {(userType === 'Customer' || userType === 'Professional') && (
            <div className="profile-row">
              <div className="profile-col">
                <div className="profile-field">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div className="profile-col">
                <div className="profile-field">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              </div>
            </div>
          )}

          {userType === 'Professional' && (
            <>
              <div className="profile-row">
                <div className="profile-col">
                  <div className="profile-field">
                    <label>Profesión</label>
                    {editing ? (
                      <select
                        name="profession"
                        value={formData.profession || 0}
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
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={professionMap[formData.profession] || 'Desconocido'}
                        disabled
                      />
                    )}
                  </div>
                </div>
                <div className="profile-col">
                  <div className="profile-field">
                    <label>Tarifa</label>
                    <input
                      type="number"
                      name="fee"
                      value={formData.fee || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>

              <div className="profile-field">
                <label>Disponibilidad</label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability || ''}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
            </>
          )}
        </div>

        <div className="profile-buttons">
          <button
            className={`profile-button ${editing ? 'success' : 'primary'}`}
            onClick={editing ? handleSave : toggleEdit}
          >
            {editing ? 'Guardar cambios' : 'Modificar'}
          </button>
          <button 
            className="profile-button danger" 
            onClick={() => setShowModal(true)}
          >
            Borrar cuenta
          </button>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro que querés eliminar esta cuenta?</Modal.Body>
        <Modal.Footer>
          <button 
            className="profile-button secondary" 
            onClick={() => setShowModal(false)}
          >
            No
          </button>
          <button 
            className="profile-button danger" 
            onClick={handleDelete}
          >
            Sí, eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Profile
