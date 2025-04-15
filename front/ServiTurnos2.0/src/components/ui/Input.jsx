import { Form } from 'react-bootstrap'

const Input = ({ label, type = 'text', value, onChange, placeholder }) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label style={{ fontWeight: 'bold' }}>{label}</Form.Label>}
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </Form.Group>
  )
}

export default Input