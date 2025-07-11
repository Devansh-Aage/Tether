import { type FC } from 'react'

interface AvatarProps {
    username: string
}

const Avatar: FC<AvatarProps> = ({ username }) => {
    return (
        <div className='size-10 cursor-pointer bg-pink-900 rounded-full flex items-center justify-center text-white text-lg'>{username.charAt(0)}</div>
    )
}

export default Avatar