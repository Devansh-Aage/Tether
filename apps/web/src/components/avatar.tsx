import { type FC } from 'react'

interface AvatarProps {
    username?: string
    imgLink?: string
    className?: string
}

const Avatar: FC<AvatarProps> = ({ username, imgLink, className }) => {
    if (username) {
        return (
            <div className={`size-10 cursor-pointer bg-pink-900 rounded-full flex items-center justify-center text-white text-lg
                 ${className}`}>{username.charAt(0)}</div>
        )
    }
    if (imgLink) {
        return (
            <div className={`size-10 cursor-pointer rounded-full flex items-center justify-center text-white text-lg ${className}`}>
                <img src={imgLink} className='object-cover rounded-full' alt="profile" />
            </div>
        )
    }

}

export default Avatar