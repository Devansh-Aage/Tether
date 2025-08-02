import type { Friend } from '@tether/db/src/types'
import { type FC } from 'react'
import Avatar from '../avatar'
import { useLocation, useNavigate } from 'react-router'


interface FriendCardProps {
    friend: Friend
}

const FriendCard: FC<FriendCardProps> = ({ friend }) => {
    const navigate = useNavigate()
    const handleClick = () => {
        navigate(`chat/${friend.friendshipId}`, { state: { friendImg: friend.profileImg, friendName: friend.username, friendId: friend.id } })
    }
    const location = useLocation();
    const pathname = location.pathname.split('/');
    const isActive = pathname.includes(friend.friendshipId)

    return (
        <div onClick={handleClick} className={`w-full flex gap-4 items-center py-2 px-3 cursor-pointer  ${isActive ? "dark:bg-cyan-800/50 bg-cyan-200" : "hover:bg-cyan-100 dark:hover:bg-cyan-950/60"}`}>
            {
                friend.profileImg ?
                    <Avatar imgLink={friend.profileImg} />
                    :
                    <Avatar username={friend.username} />
            }
            <div className='flex-1 min-w-0'>
                <p className='font-semibold'>{friend.username}</p>
                {/* <p className='text-sm truncate'>Last text:shshhsh Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro, in fugiat numquam alias possimus molestias? Natus expedita aspernatur maxime odit?</p> */}
            </div>

        </div>
    )
}

export default FriendCard