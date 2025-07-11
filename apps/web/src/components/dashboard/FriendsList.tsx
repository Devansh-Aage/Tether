import { useEffect, useState, type FC } from 'react'
import FriendCard from './FriendCard'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '../ui/skeleton';
import type { Friend } from '@tether/db/src/types';
import socket from '@/lib/socket';


interface FriendsListProps {

}

const FriendsList: FC<FriendsListProps> = ({ }) => {
    const { userId, isAuthLoading } = useAuth();
    const [input, setInput] = useState("")
    const [friends, setFriends] = useState<Friend[]>()

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ["userFriends"],
        queryFn: async (): Promise<{ friends: Friend[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/get-friends`, {
                withCredentials: true
            })
            return res.data
        },
    })
    useEffect(() => {
        if (isSuccess) {
            setFriends(data.friends)
        }
    }, [isSuccess, data])



    const filteredChats = friends?.filter((friend) =>
        friend.username.toLowerCase().includes(input.toLowerCase())
    );
    return (
        <div className='w-xs h-full bg-light-bg dark:bg-dark-bg font-nunito'>
            <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder='Search' className='bg-inputBg rounded-md py-1 px-2 my-3 ml-3 border dark:border-white border-black focus:border-transparent ring-transparent ring-2 focus:ring-action w-[90%] mx-auto' />
            {
                isAuthLoading || isLoading ?
                    Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className='w-full h-28' />
                    ))
                    :
                    filteredChats &&
                        filteredChats.length > 0 ?
                        filteredChats.map((friend) => (
                            <FriendCard friend={friend} key={friend.email} />
                        ))
                        :
                        <p>Friend list is empty</p>


            }
        </div>
    )
}

export default FriendsList