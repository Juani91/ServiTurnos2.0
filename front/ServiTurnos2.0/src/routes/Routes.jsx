import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'

const Routes = () => {
  return (
    <ReactRoutes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </ReactRoutes>
  )
}

export default Routes
