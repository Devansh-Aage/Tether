
import { Route, Routes } from 'react-router'
import './App.css'
import Login from './page/auth/Login'
import Dashboard from './page/protected/Dashboard'
import { Toaster } from './components/ui/sonner'
import SignUp from './page/auth/SignUp'

function App() {

  return (
    <>

      <Toaster />
      <Routes>
        <Route path='/auth' >
          <Route path='login' element={<Login />} />
          <Route path='signup' element={<SignUp />} />
        </Route>
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
