import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { Form, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Register = () => {

    const [userType, setUserType] = useState('Customer')

    const { showToast } = useToast()

    const navigate = useNavigate()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        const payload = {
            firstName,
            lastName,
            email,
            password
        }

        // ver esto
        setFirstName("")
        setLastName("")
        setEmail("")
        setPassword("")

        console.log(`${userType}Request:`, payload)

        showToast('¡Usuario registrado con éxito!', 'success')

        setTimeout(() => {
            navigate('/')
          }, 750)

        // Más adelante: hacer el POST al endpoint correspondiente
    }

    return (
        <div style={{
            height: "100vh",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#b8b3ac'
        }}>
            <Container style={{
                maxWidth: '400px',
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 0 12px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Registrarse</h2>

                <Form onSubmit={handleSubmit}>

                    <Input
                        label="Nombre"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ingresá tu nombre" />

                    <Input
                        label="Apellido"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ingresá tu apellido" />

                    <Input
                        label="Email"
                        type="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingresá tu email" />

                    <Input
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresá una contraseña" />

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 'bold' }}>Rol</Form.Label>
                        <Form.Select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <option value="Customer">Cliente</option>
                            <option value="Professional">Profesional</option>
                        </Form.Select>
                    </Form.Group>

                    <Button
                        type="submit"
                        variant="primary"
                        style={{ width: '100%', marginTop: '16px' }}
                    >
                        Registrarme
                    </Button>

                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <span>¿Ya tenés cuenta? </span>
                        <Link to="/">Iniciar sesión</Link>
                    </div>
                </Form>
            </Container>
        </div>
    )
}

export default Register
