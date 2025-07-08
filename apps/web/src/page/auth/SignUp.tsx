import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import InputTether from '@/components/ui/InputTether';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from '@tether/common/src/zodHttpSchemas';
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

interface SignUpProps {

}

type FormData = z.infer<typeof registerUser>

const SignUp: FC<SignUpProps> = ({ }) => {
    const router = useNavigate();
    const [googleLoading, setGoogleLoading] = useState(false)
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(registerUser),
    });

    const onSubmit = async (data: FormData) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_HTTP_URL}auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password
                })
            });
            if (res.ok) {
                toast.success("Registered at Tether")
                router("/auth/login")
            }
            else {
                const response = await res.json();
                toast.error(response.message)
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError("username", { message: error.message });
                setError("email", { message: error.message });
                setError("password", { message: error.message });
                return;
            }
            else {
                console.error("Failed to register: ", error)
                toast.error("An unexpected error occurred!")
            }
        }
        finally {
            reset()
        }
    }

    const handleGoogleLogin = () => {
        setGoogleLoading(true)
        window.location.href = `${import.meta.env.VITE_HTTP_URL}auth/login-with-google`
    }

    return (
        <AuthLayout>
            <div className='flex justify-center'>
                <div className=' max-w-lg  flex flex-col gap-3'>
                    <p className='text-black dark:text-white font-medium text-center text-3xl'>Sign up at Tether</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <InputTether error={errors.username?.message} {...register("username")} htmlFor='username' title='Username' />
                        <InputTether error={errors.email?.message} {...register("email")} htmlFor='email' title='Email' />
                        <InputTether error={errors.password?.message} {...register("password")} htmlFor='password' title='Password' />
                        <Button disabled={isSubmitting || googleLoading} className='mt-5 py-5 w-full font-semibold text-lg' variant='tether' >{isSubmitting ? 'Signing up...' : 'Sign up'}</Button>
                    </form>
                    <Separator className='my-3 h-[2px] ' />
                    <Button onClick={handleGoogleLogin} disabled={isSubmitting || googleLoading} className='font-semibold py-5 flex items-center'>
                        <svg
                            className="mr-2 size-5"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fab"
                            data-icon="github"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        <span className='text-lg'>
                            Sign in with Google
                        </span>
                    </Button>
                    <div className='flex items-center gap-3 mt-5 justify-center'>
                        <p>Already have an account?</p>
                        <NavLink to="/auth/login" className="text-blue-600 hover:underline-offset-2 hover:underline" >Log in</NavLink>
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}

export default SignUp