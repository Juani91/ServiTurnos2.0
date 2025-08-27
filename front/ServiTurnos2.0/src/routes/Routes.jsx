import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Login from '../pages/Login/Login'
import Register from '../pages/register/Register'
import Home from '../pages/home/Home'
import Layout from '../components/layout/Layout' // 🆕 importamos el layout
import Profile from '../pages/profile/Profile'
import SearchProfessionals from '../pages/searchProfessionals/searchProfessionals'
import SearchCustProfess from '../pages/searchCustProfess/SearchCustProfess'
import ViewSentMeetings from '../pages/viewSentMeetings/ViewSentMeetings'
import ViewReceivedMeetings from '../pages/viewReceivedMeetings/ViewReceivedMeetings'
import ViewAceptedMeetings from '../pages/viewAceptedMeetings/ViewAceptedMeetings'
import NotFound from '../pages/notFound/NotFound'

// Importamos los componentes protectores
import AdminProtected from './AdminProtected'
import CustomerProtected from './CustomerProtected'
import ProfessionalProtected from './ProfessionalProtected'

const Routes = () => {
  return (
    <ReactRoutes>

      {/* Rutas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* Rutas internas (con layout y protección) */}
      <Route element={<Layout />}>

        {/* Ruta general para todos los usuarios autenticados */}
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />

        {/* Rutas solo para Customers */}
        <Route 
          path="/buscar-profesionales" 
          element={
            <CustomerProtected>
              <SearchProfessionals />
            </CustomerProtected>
          } 
        />

        <Route 
          path="/solicitudes-enviadas" 
          element={
            <CustomerProtected>
              <ViewSentMeetings />
            </CustomerProtected>
          } 
        />

        {/* Rutas solo para Professionals */}
        <Route 
          path="/ver-solicitudes" 
          element={
            <ProfessionalProtected>
              <ViewReceivedMeetings />
            </ProfessionalProtected>
          } 
        />

        <Route 
          path="/ver-aceptadas" 
          element={
            <ProfessionalProtected>
              <ViewAceptedMeetings />
            </ProfessionalProtected>
          } 
        />

        {/* Rutas solo para Admins */}
        <Route 
          path="/ver-usuarios" 
          element={
            <AdminProtected>
              <SearchCustProfess />
            </AdminProtected>
          }
        />

        {/* Después sumamos acá: /solicitudes (Professional), /citas (Customer/Professional), /ver-citas (Admin), etc. */}

      </Route>

      {/* Ruta específica para 404 */}
      <Route path="/404" element={<NotFound />} />

      {/* Ruta catch-all para páginas no encontradas - DEBE IR AL FINAL */}
      <Route path="*" element={<NotFound />} />

    </ReactRoutes>
  )
}

export default Routes
