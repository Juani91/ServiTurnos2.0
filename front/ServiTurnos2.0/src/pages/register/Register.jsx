import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../context/toastContext/ToastContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { Form, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import './Register.css'

const Register = () => {
    const [userType, setUserType] = useState('Customer')

    const { showToast } = useToast()
    const { RegisterCustomer, RegisterProfessional } = useUsers()

    const navigate = useNavigate()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = { firstName, lastName, email, password }

        const result = userType === 'Customer'
            ? await RegisterCustomer(payload)
            : await RegisterProfessional(payload)

        if (result.success) {
            showToast(result.msg, 'success')

            setFirstName('')
            setLastName('')
            setEmail('')
            setPassword('')

            setTimeout(() => navigate('/'), 1000)
        } else {
            showToast(result.msg, 'error')
        }
    }

    return (
        <div className="register-page">
            <Container className="register-container">
                <h2 className="register-title">Registrarse</h2>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingresá tu email" />

                    <Input
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresá una contraseña" />

                    <Form.Group className="register-role-group">
                        <Form.Label className="register-role-label">Rol</Form.Label>
                        <Form.Select value={userType} onChange={(e) => setUserType(e.target.value)}>
                            <option value="Customer">Cliente</option>
                            <option value="Professional">Profesional</option>
                        </Form.Select>
                    </Form.Group>

                    <Button type="submit" variant="primary" className="register-btn">
                        Registrarme
                    </Button>

                    <div className="register-login-link">
                        <span>¿Ya tenés cuenta? </span>
                        <Link to="/">Iniciar sesión</Link>
                    </div>
                </Form>
            </Container>
        </div>
    )
}

export default Register
