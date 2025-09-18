import { useEffect, useState } from 'react'
import './Toast.css'

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
    <div className={`toast-serviturnos toast-${type} ${visible ? 'toast-visible' : ''}`}>
      {message}
    </div>
  )
}

export default Toast
