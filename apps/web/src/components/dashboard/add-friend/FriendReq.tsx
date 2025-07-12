import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FriendRequest } from '@tether/db/src/types'
import axios from 'axios'
import { useEffect, type FC } from 'react'
import { Skeleton } from '../../ui/skeleton'
import FriendReqCard from './FriendReqCard'
import socket from '@/lib/socket'
import { INCOMING_FRIEND_REQUEST } from '@tether/common/src/eventConstants'

interface FriendReqProps {

}

const FriendReq: FC<FriendReqProps> = ({ }) => {
    const queryClient = useQueryClient()
    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ["userFriendReq"],
        queryFn: async (): Promise<{ friendReq: FriendRequest[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/get-friend-req`, {
                withCredentials: true
            })
            return res.data
        },
    })



    useEffect(() => {
        const incomingFrndReqHandler = (newReq: FriendRequest) => {
            queryClient.setQueryData<{ friendReq: FriendRequest[] }>(
                ["userFriendReq"],
                (old) => ({
                    friendReq: [...(old?.friendReq ?? []), newReq]
                })
            );
        };
        socket.on(INCOMING_FRIEND_REQUEST, incomingFrndReqHandler)
        return (() => {
            socket.off(INCOMING_FRIEND_REQUEST, incomingFrndReqHandler)
        })
    }, [])

    return (
        <div className='w-full flex flex-wrap gap-3'>
            {isLoading ?
                Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className='w-xs h-20' />
                ))
                :
                isSuccess &&
                    data.friendReq.length > 0 ?
                    data.friendReq.map((f) => (
                        <FriendReqCard friendReq={f} key={f.id} />
                    ))
                    :
                    <p>No Friend Requests</p>
            }
        </div>
    )
}

export default FriendReq