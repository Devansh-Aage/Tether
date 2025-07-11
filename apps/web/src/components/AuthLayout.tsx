import { useAuth } from '@/context/AuthContext'
import { type FC, type ReactNode } from 'react'
import { Navigate } from 'react-router'

interface AuthLayoutProps {
    children: ReactNode
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    const { isAuthenticated, isAuthLoading } = useAuth()
    if (isAuthLoading) {
        return (
            <div>Loading ...</div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return (
        <div className='font-nunito h-screen w-full bg-light-bg dark:bg-dark-bg'>
            <p className='text-3xl font-medium pt-5 pl-5' > Tether</p>
            <div className='mt-20 flex justify-center'>
                {children}
            </div>
        </div >

    )

}

export default AuthLayout