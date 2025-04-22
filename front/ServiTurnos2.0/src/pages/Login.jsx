import { Link, useNavigate } from 'react-router-dom' // 🆕 Importamos navigate para redirigir
import { useState } from 'react'
import { Form, Container } from 'react-bootstrap'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../services/authentication/AuthContext' // 🆕 Importamos el hook de autenticación
import { useToast } from '../context/toastContext/ToastContext' // 🆕 Importamos el hook del Toast

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login } = useAuth() // 🆕 Obtenemos la función login
  const { showToast } = useToast() // 🆕 Obtenemos la función showToast
  const navigate = useNavigate() // 🆕 Para redireccionar luego del login

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await login(email, password) // 🆕 Llamamos a login del contexto

    if (!result.success) {
      showToast(result.msg, 'error') // 🆕 Si falla, mostramos el mensaje que vino del back
      return
    }

    const decoded = parseJwt(result.token) // 🆕 Decodificamos el token JWT
    const userType = decoded?.UserType

    // 🆕 Redirigimos a home
    navigate('/home')
  }

  return (
    <div
      style={{
        height: "100vh",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Container style={{
        maxWidth: '400px',
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 0 12px rgba(0, 0, 0, 0.1)'
      }}>

        <h2 style={{ marginBottom: '2vh', textAlign: 'center' }}>Iniciar sesión</h2>

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
            style={{ width: '100%', marginTop: '2vh' }}
          >
            Iniciar sesión
          </Button>

          <div style={{ marginTop: '2vh', textAlign: 'center' }}>
            <span>¿No tenés cuenta? </span>
            <Link to="/register">Registrarse</Link>
          </div>
        </Form>
      </Container>
    </div>
  )
}

export default Login
