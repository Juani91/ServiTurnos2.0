import { Button as BootstrapButton } from 'react-bootstrap'

const Button = ({ type = 'button', onClick, children, variant = 'primary', className, style }) => {
  return (
    <BootstrapButton
      type={type}
      onClick={onClick}
      variant={variant}
      className={className}
      style={style}
    >
      {children}
    </BootstrapButton>
  )
}

export default Button