import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Login from '../pages/Login/Login'
import Register from '../pages/register/Register'
import Home from '../pages/home/Home'
import Layout from '../components/layout/Layout' // 🆕 importamos el layout
import Profile from '../pages/profile/Profile'
import SearchProfessionals from '../pages/searchProfessionals/searchProfessionals'
import SearchCustProfess from '../pages/searchCustProfess/SearchCustProfess'

const Routes = () => {
  return (
    <ReactRoutes>

      {/* Rutas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* Rutas internas (con layout) */}
      <Route element={<Layout />}>

        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/buscar" element={<SearchProfessionals />} />
        <Route path="/ver-usuarios" element={<SearchCustProfess />} />

        {/* Después sumamos acá: /solicitudes, /citas, /ver-citas, etc. */}

      </Route>

    </ReactRoutes>
  )
}

export default Routes
