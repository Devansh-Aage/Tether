import { type FC } from 'react'

interface LoginProps {

}

const Login: FC<LoginProps> = ({ }) => {
    return (
        <div className='h-screen w-full bg-light-bg dark:bg-dark-bg flex items-center justify-center'>
            {/* <a href='http://localhost:5000/api/auth/login-with-google' >Login with Google</a> */}
            <div className='bg-slate-200 max-w-lg p-10'>
                
            </div>

        </div>
    )
}

export default Login