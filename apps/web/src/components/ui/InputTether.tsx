import { type FC } from 'react'

interface InputTetherProps extends React.InputHTMLAttributes<HTMLInputElement> {
    title: string
    htmlFor: string
    inputType?: string
    className?: string
    error?: string
}

const InputTether: FC<InputTetherProps> = ({ htmlFor, title, inputType = 'text', className, error, ...props }) => {
    return (
        <div className={`flex-1 flex mt-3 flex-col ${className}`}>
            <label htmlFor={htmlFor} className='text-black dark:text-white text-sm' >{title}</label>
            <input className='bg-inputBg rounded-md px-4 py-2 mt-1 border dark:border-white border-black focus:border-transparent ring-transparent ring-2 focus:ring-action text-black dark:text-white min-w-xs' type={inputType} placeholder={`Enter ${title}`} {...props} />
            {error && <p className="text-sm text-red-700 mt-1">{error}</p>}
        </div>
    )
}

export default InputTether