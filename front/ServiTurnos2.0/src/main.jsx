import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './services/authentication/AuthContext'
import { UsersProvider } from './services/usersContext/UsersContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UsersProvider>
        <App />
      </UsersProvider>
    </AuthProvider>
  </StrictMode>
)
