import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../../context/toastContext/ToastContext'
import { useUsers } from '../../services/usersContext/UsersContext'
import { Form, Container } from 'react-bootstrap'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import './Register.css'

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userType: 'Customer'
    })

    const { showToast } = useToast()
    const { RegisterCustomer, RegisterProfessional } = useUsers()
    const navigate = useNavigate()

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            userType: 'Customer'
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const { firstName, lastName, email, password, userType } = formData

        const result = userType === 'Customer'
            ? await RegisterCustomer({ firstName, lastName, email, password })
            : await RegisterProfessional({ firstName, lastName, email, password })

        if (result.success) {
            showToast(result.msg, 'success')
            resetForm()
            setTimeout(() => navigate('/'), 1000)
        } else {
            showToast(result.msg, 'error')
        }
    }

    return (
        <div className="register-page">
            <Container className="register-container">
                <h2 className="text-center mb-4">Registrarse</h2>
                <Form onSubmit={handleSubmit}>
                    <Input
                        label="Nombre"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange('firstName')}
                        placeholder="Ingresá tu nombre"
                    />
                    <Input
                        label="Apellido"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange('lastName')}
                        placeholder="Ingresá tu apellido"
                    />
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
                        placeholder="Ingresá una contraseña"
                    />
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 'bold' }}>Rol</Form.Label>
                        <Form.Select 
                            value={formData.userType} 
                            onChange={handleInputChange('userType')}
                        >
                            <option value="Customer">Cliente</option>
                            <option value="Professional">Profesional</option>
                        </Form.Select>
                    </Form.Group>

                    <Button type="submit" className="w-100 mt-3">
                        Registrarme
                    </Button>

                    <div className="text-center mt-3">
                        <span>¿Ya tenés cuenta? </span>
                        <Link to="/">Iniciar sesión</Link>
                    </div>
                </Form>
            </Container>
        </div>
    )
}

export default Register
