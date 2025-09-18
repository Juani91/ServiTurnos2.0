import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Form, Container } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../services/authentication/AuthContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { Login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      return null
    }
  }

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await Login(formData.email, formData.password)

    if (!result.success) {
      showToast(result.msg, 'error')
      return
    }

    parseJwt(result.token) // Mantener para posible uso futuro
    navigate('/home')
  }

  return (
    <div className="login-page">
      <Container className="login-container">
        <h2 className="text-center mb-4">Iniciar sesión</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Ingresá tu email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Ingresá tu contraseña"
          />
          <Button type="submit" className="w-100 mt-3">
            Iniciar sesión
          </Button>
          <div className="text-center mt-3">
            <span>¿No tenés cuenta? </span>
            <Link to="/register">Registrarse</Link>
          </div>
        </Form>
      </Container>
    </div>
  )
}

export default Login
