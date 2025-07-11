import { useAuth } from '@/context/AuthContext'
import { type FC } from 'react'
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
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}

export default ProtectedRoute