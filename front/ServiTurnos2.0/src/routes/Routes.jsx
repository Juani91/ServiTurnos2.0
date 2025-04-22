import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Home from '../pages/Home'

const Routes = () => {
  return (
    <ReactRoutes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/home' element={<Home />} />
    </ReactRoutes>
  )
}

export default Routes
