import type { FriendRequest } from '@tether/db/src/types'
import { type FC } from 'react'
import Avatar from '../../avatar'
import { Button } from '../../ui/button'
import { Check, X } from 'lucide-react'
import socket from '@/lib/socket'
import { ACCEPT_FRIEND_REQ, DENY_FRIEND_REQ } from '@tether/common/src/eventConstants'
import { useQueryClient } from '@tanstack/react-query'

interface FriendReqCardProps {
    friendReq: FriendRequest
}

const FriendReqCard: FC<FriendReqCardProps> = ({ friendReq }) => {
    const queryClient = useQueryClient();
    const acceptFrndReq = () => {
        socket.emit(ACCEPT_FRIEND_REQ, {
            id: friendReq.id,
            senderId: friendReq.senderId,
            receiverId: friendReq.receiverId
        })
        queryClient.invalidateQueries({ queryKey: ["userFriendReq"] });
        queryClient.invalidateQueries({ queryKey: ["userFriends"] });
    }

    const denyFrndReq = () => {
        socket.emit(DENY_FRIEND_REQ, {
            id: friendReq.id,
            senderId: friendReq.senderId,
            receiverId: friendReq.receiverId
        })
        queryClient.invalidateQueries({ queryKey: ["userFriendReq"] });
        queryClient.invalidateQueries({ queryKey: ["userFriends"] });
    }

    return (
        <div key={friendReq.id} className='border border-foreground/30 px-3 py-2 flex items-center gap-3 rounded-lg shadow'>
            {
                friendReq.senderImg ?
                    <div>
                        <img src={friendReq.senderImg} alt="" />
                    </div> :
                    <Avatar username={friendReq.senderUsername} />
            }
            <div className=''>
                <p>{friendReq.senderUsername}</p>
                <p className='text-sm'>{friendReq.senderEmail}</p>
            </div>
            <div className='flex items-center gap-2 ml-2'>
                <Button onClick={acceptFrndReq} className='hover:bg-action transition-all duration-200' size="icon"><Check /></Button>
                <Button onClick={denyFrndReq} className='hover:bg-red-500 transition-all duration-200' size="icon"><X /></Button>
            </div>
        </div>
    )
}

export default FriendReqCard