import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Form } from 'react-bootstrap'
import { Container } from 'react-bootstrap'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Email:', email)
    console.log('Password:', password)
    // Aquí después llamaremos a la API
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

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <span>¿No tenés cuenta? </span>
            <Link to="/register">Registrarse</Link>
          </div>

        </Form>
      </Container>
    </div>
  )
}

export default Login
