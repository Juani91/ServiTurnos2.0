import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/authentication/AuthContext';
import { Nav } from 'react-bootstrap';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  };

  const decoded = token ? parseJwt(token) : null;
  const userType = decoded?.UserType;

  // Función para determinar si un botón está activo
  const isActive = (path) => location.pathname === path;

  return (

    <div>

      <Nav fill defaultActiveKey="#" style={{ width: '100%' }}>

        <Nav.Item style={{ flex: 1 }}>

          <Nav.Link
            onClick={() => {
              // if (userType === 'Customer' || userType === 'Admin') navigate('/profile');
              // else if (userType === 'Professional') navigate('/profile');
              navigate('/profile');
            }}
            className={`buttons ${isActive('/profile') ? 'active' : ''}`}
          >
            Perfil
          </Nav.Link>
        </Nav.Item>

        <Nav.Item style={{ flex: 1 }}>
          <Nav.Link
            onClick={() => {
              if (userType === 'Customer') navigate('/buscar-profesionales');
              else if (userType === 'Professional') navigate('/solicitudes');
              else if (userType === 'Admin') navigate('/ver-usuarios');
            }}
            className={`buttons ${
              (userType === 'Customer' && isActive('/buscar-profesionales')) ||
              (userType === 'Professional' && isActive('/solicitudes')) ||
              (userType === 'Admin' && isActive('/ver-usuarios'))
                ? 'active' : ''
            }`}
          >
            {userType === 'Customer' && 'Buscar Profesionales'}
            {userType === 'Professional' && 'Solicitudes'}
            {userType === 'Admin' && 'Ver usuarios'}
          </Nav.Link>
        </Nav.Item>

        <Nav.Item style={{ flex: 1 }}>
          <Nav.Link
            onClick={() => {
              if (userType === 'Professional' || userType === 'Customer') navigate('/citas');
              else if (userType === 'Admin') navigate('/ver-citas');
            }}
            className={`buttons ${
              ((userType === 'Professional' || userType === 'Customer') && isActive('/citas')) ||
              (userType === 'Admin' && isActive('/ver-citas'))
                ? 'active' : ''
            }`}
          >
            {(userType === 'Professional' || userType === 'Customer') && 'Citas'}
            {userType === 'Admin' && 'Ver citas'}
          </Nav.Link>
        </Nav.Item>

      </Nav>

    </div>

  );
};

export default Navbar;
