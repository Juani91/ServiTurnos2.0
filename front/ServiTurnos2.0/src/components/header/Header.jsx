import { useAuth } from "../../services/authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import "./Header.css";

const Header = () => {
  const { Logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Logout();
    navigate("/");
  };

  return (
    <div className="header">
      <Container fluid className="header-container">
        <div className="header-space" />
        <h2 className="header-title">ServiTurnos</h2>
        <Button
          variant="danger"
          size="sm"
          onClick={handleLogout}
          className="header-logout"
        >
          Logout
        </Button>
      </Container>
    </div>
  );
};

export default Header;
