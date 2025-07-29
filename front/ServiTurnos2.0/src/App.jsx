import Routes from './routes/Routes'
import { BrowserRouter } from 'react-router-dom'


const App = () => {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  )
}

export default App