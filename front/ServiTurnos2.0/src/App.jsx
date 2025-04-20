import Routes from './routes/Routes'
import { BrowserRouter } from 'react-router-dom'
import ToastProvider from './context/ToastProvider'

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App