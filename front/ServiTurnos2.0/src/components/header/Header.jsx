import { useAuth } from "../../services/authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Button, Navbar } from "react-bootstrap";
import "./Header.css";

const Header = () => {
  const { Logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Logout();
    navigate("/");
  };

  const handleTitleClick = () => {
    navigate("/home");
  };

  return (
    <Navbar className="header" expand="lg">
      <Container fluid className="d-flex justify-content-between align-items-center py-2">
        <div className="header-space" />
        <Navbar.Brand 
          as="h2" 
          className="header-title mb-0 flex-grow-1 text-center"
        >
          <span
            onClick={handleTitleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleClick()}
            className="header-title-text"
          >
            ServiTurnos
          </span>
        </Navbar.Brand>
        <Button
          variant="danger"
          size="sm"
          onClick={handleLogout}
          className="header-logout"
        >
          Logout
        </Button>
      </Container>
    </Navbar>
  );
};

export default Header;
