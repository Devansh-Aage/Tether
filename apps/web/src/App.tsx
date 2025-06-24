
import { Route, Routes } from 'react-router'
import './App.css'
import Login from './page/auth/Login'
import Dashboard from './page/protected/Dashboard'

function App() {

  return (
    <>

      <Routes>
        <Route path='/auth' >
          <Route path='login' element={<Login />} />
        </Route>
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
