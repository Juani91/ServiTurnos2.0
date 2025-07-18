import { Form } from 'react-bootstrap'

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  name = '',
  disabled = false
}) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label style={{ fontWeight: 'bold' }}>{label}</Form.Label>}
      <Form.Control
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
      />
    </Form.Group>
  )
}

export default Input