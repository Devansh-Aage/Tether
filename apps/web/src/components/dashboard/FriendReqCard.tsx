import type { FriendRequest } from '@tether/db/src/types'
import { type FC } from 'react'
import Avatar from '../avatar'
import { Button } from '../ui/button'
import { Check, X } from 'lucide-react'

interface FriendReqCardProps {
    friendReq: FriendRequest
}

const FriendReqCard: FC<FriendReqCardProps> = ({ friendReq }) => {
    return (
        <div className='border border-foreground/40 px-3 py-2 flex items-center gap-3 rounded-lg shadow'>
            {
                friendReq.profileImg ?
                    <div>
                        <img src={friendReq.profileImg} alt="" />
                    </div> :
                    <Avatar username={friendReq.username} />
            }
            <div className=''>
                <p>{friendReq.username}</p>
                <p className='text-sm'>{friendReq.email}</p>
            </div>
            <div className='flex items-center gap-2 ml-2'>
                <Button className='hover:bg-green-500 transition-all duration-200' size="icon"><Check /></Button>
                <Button className='hover:bg-red-500 transition-all duration-200' size="icon"><X /></Button>
            </div>
        </div>
    )
}

export default FriendReqCard