import { useQuery } from '@tanstack/react-query'
import type { FriendRequest } from '@tether/db/src/types'
import axios from 'axios'
import { useEffect, useState, type FC } from 'react'
import { Skeleton } from '../ui/skeleton'
import FriendReqCard from './FriendReqCard'

interface FriendReqProps {

}

const FriendReq: FC<FriendReqProps> = ({ }) => {
    const [friendReq, setFriendReq] = useState<FriendRequest[]>()

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ["userFriendReq"],
        queryFn: async (): Promise<{ requestSenders: FriendRequest[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/get-friend-req`, {
                withCredentials: true
            })
            return res.data
        },
    })

    useEffect(() => {
        if (isSuccess) {
            setFriendReq(data.requestSenders)
        }
    }, [isSuccess, data])
    return (
        <div className='w-full flex flex-wrap gap-3'>
            {isLoading ?
                Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className='w-sm h-28' />
                ))
                :
                friendReq &&
                    friendReq.length > 0 ?
                    friendReq.map((f) => (
                        <FriendReqCard friendReq={f} key={f.id} />
                    ))
                    :
                    <p>No Friend Requests</p>
            }
        </div>
    )
}

export default FriendReq