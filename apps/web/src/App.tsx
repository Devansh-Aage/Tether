
import { Navigate, Route, Routes } from 'react-router'
import './App.css'
import Login from './page/auth/Login'
import Dashboard from './page/protected/Dashboard'
import { Toaster } from './components/ui/sonner'
import SignUp from './page/auth/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import AddFriend from './page/protected/AddFriend'
import { useEffect } from 'react'
import socket from './lib/socket'

function App() {

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }
    return (() => {
      socket.disconnect()
    })
  }, [])


  return (
    <>
      <Toaster />
      <Routes>

        <Route path='/auth' >
          <Route path='login' element={<Login />} />
          <Route path='signup' element={<SignUp />} />
        </Route>

        <Route element={<ProtectedRoute />} >
          <Route path='dashboard' element={<Dashboard />} >
            <Route path='add-friend' element={<AddFriend />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to="/auth/login" replace />} />

      </Routes>
    </>
  )
}

export default App
