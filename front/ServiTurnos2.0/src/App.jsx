import ToastProvider from './context/toastContext/ToastProvider'
import Routes from './routes/Routes'
import { BrowserRouter } from 'react-router-dom'


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