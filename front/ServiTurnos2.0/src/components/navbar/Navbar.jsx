import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/authentication/AuthContext';
import { Nav } from 'react-bootstrap';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
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
            className="buttons"
          >
            Perfil
          </Nav.Link>
        </Nav.Item>

        <Nav.Item style={{ flex: 1 }}>
          <Nav.Link
            onClick={() => {
              if (userType === 'Customer') navigate('/buscar');
              else if (userType === 'Professional') navigate('/solicitudes');
              else if (userType === 'Admin') navigate('/ver-usuarios');
            }}
            className="buttons"
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
            className="buttons"
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
