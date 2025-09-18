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

  const isActive = (path) => location.pathname === path;

  const navigationConfig = {
    Customer: {
      secondButton: { path: '/buscar-profesionales', label: 'Buscar Profesionales' },
      thirdButton: { path: '/solicitudes-enviadas', label: 'Citas' }
    },
    Professional: {
      secondButton: { path: '/ver-solicitudes', label: 'Solicitudes' },
      thirdButton: { path: '/ver-aceptadas', label: 'Citas' }
    },
    Admin: {
      secondButton: { path: '/ver-usuarios', label: 'Ver usuarios' },
      thirdButton: { path: '/ver-citas', label: 'Citas' }
    }
  };

  const config = navigationConfig[userType] || {};

  const handleNavigation = (buttonType) => {
    if (buttonType === 'profile') {
      navigate('/profile');
    } else if (buttonType === 'second' && config.secondButton) {
      navigate(config.secondButton.path);
    } else if (buttonType === 'third' && config.thirdButton) {
      navigate(config.thirdButton.path);
    }
  };

  return (
    <Nav fill className="w-100">
      <Nav.Item className="flex-fill">
        <Nav.Link
          onClick={() => handleNavigation('profile')}
          className={`buttons ${isActive('/profile') ? 'active' : ''}`}
        >
          Perfil
        </Nav.Link>
      </Nav.Item>

      {config.secondButton && (
        <Nav.Item className="flex-fill">
          <Nav.Link
            onClick={() => handleNavigation('second')}
            className={`buttons ${isActive(config.secondButton.path) ? 'active' : ''}`}
          >
            {config.secondButton.label}
          </Nav.Link>
        </Nav.Item>
      )}

      {config.thirdButton && (
        <Nav.Item className="flex-fill">
          <Nav.Link
            onClick={() => handleNavigation('third')}
            className={`buttons ${isActive(config.thirdButton.path) ? 'active' : ''}`}
          >
            {config.thirdButton.label}
          </Nav.Link>
        </Nav.Item>
      )}
    </Nav>
  );
};

export default Navbar;
