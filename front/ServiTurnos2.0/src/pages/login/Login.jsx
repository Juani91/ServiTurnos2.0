import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Form, Container } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../services/authentication/AuthContext'
import { useToast } from '../../context/toastContext/ToastContext'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await Login(email, password)

    if (!result.success) {
      showToast(result.msg, 'error')
      return
    }

    const decoded = parseJwt(result.token)
    const userType = decoded?.UserType

    navigate('/home')
  }

  return (
    <div className="login-page">
      <Container className="login-container">
        <h2 className="login-title">Iniciar sesión</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresá tu email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresá tu contraseña"
          />
          <Button
            type="submit"
            variant="primary"
            className="login-btn"
          >
            Iniciar sesión
          </Button>
          <div className="login-register">
            <span>¿No tenés cuenta? </span>
            <Link to="/register">Registrarse</Link>
          </div>
        </Form>
      </Container>
    </div>
  )
}

export default Login
