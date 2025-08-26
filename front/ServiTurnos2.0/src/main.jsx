import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './services/authentication/AuthContext'
import { UsersProvider } from './services/usersContext/UsersContext'
import { MeetingsProvider } from './services/meetingsContext/MeetingsContext'
import ToastProvider from './context/toastContext/ToastProvider'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UsersProvider>
        <MeetingsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </MeetingsProvider>
      </UsersProvider>
    </AuthProvider>
  </StrictMode>
)
