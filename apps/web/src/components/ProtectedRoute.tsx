import { useAuth } from '@/context/AuthContext'
import socket from '@/lib/socket'
import { useEffect, type FC } from 'react'
import { Navigate, Outlet } from 'react-router'

interface ProtectedRouteProps {

}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ }) => {
    const { isAuthenticated, isAuthLoading } = useAuth()

    if (isAuthLoading) {
        return (
            <div>Loading ...</div>
        )
    }

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }
        return (() => {
            socket.disconnect()
        })
    }, [])


    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}

export default ProtectedRoute