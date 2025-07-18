import { useAuth } from '../../services/authentication/AuthContext'
import './Home.css'

// Función para decodificar el token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const Home = () => {
  const { token } = useAuth()
  const decoded = token ? parseJwt(token) : null
  const userType = decoded?.UserType

  return (
    <main className="home-serviturnos">
      <h2>Hola {userType}</h2>
    </main>
  )
}

export default Home