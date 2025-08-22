import { useState, type FC } from 'react'
import FriendCard from './FriendCard'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '../ui/skeleton';
import type { Friend } from '@tether/db/src/types';
import { cn } from '@/lib/utils';


interface FriendsListProps {
    friends: Friend[]
    isLoading: boolean
}

const FriendsList: FC<FriendsListProps> = ({ friends, isLoading }) => {
    const { isAuthLoading } = useAuth();
    const [input, setInput] = useState("")

    const filteredChats = friends?.filter((friend) =>
        friend.username.toLowerCase().includes(input.toLowerCase())
    );

    return (
        <div className='w-full'>
            <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder='Search' className={cn(
                "file:text-foreground my-2 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-7 w-[95%] mx-auto min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-action/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            )} />
            {
                isAuthLoading || isLoading ?
                    Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className='w-full h-14 mb-1 bg-foreground/20 ' />
                    ))
                    :
                    filteredChats &&
                        filteredChats.length > 0 ?
                        filteredChats.map((friend) => (
                            <FriendCard friend={friend} key={friend.email} />
                        ))
                        :
                        <p className='ml-4 mt-4'>Friend list is empty</p>

            }
        </div>
    )
}

export default FriendsList