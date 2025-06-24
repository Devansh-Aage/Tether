import { type FC } from 'react'

interface LoginProps {

}

const Login: FC<LoginProps> = ({ }) => {
    return (
        <div>
            <a href='http://localhost:5000/api/auth/login-with-google' >Login with Google</a>
        </div>
    )
}

export default Login