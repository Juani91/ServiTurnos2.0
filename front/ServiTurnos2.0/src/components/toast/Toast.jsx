import { useEffect, useState } from 'react'
import './Toast.css'

const toastColors = {
  success: '#198754',
  error: '#dc3545',
  info: '#0d6efd'
}

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)

    const hideTimer = setTimeout(() => setVisible(false), duration - 300)
    const closeTimer = setTimeout(onClose, duration)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  return (
    <div className={`toast-serviturnos toast-${type} ${visible ? 'toast-visible' : ''}`} style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: toastColors[type] || toastColors.info,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 9999,
      fontWeight: 'bold',
      maxWidth: '300px',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)'
    }}>
      {message}
    </div>
  )
}

export default Toast
