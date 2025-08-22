import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { Group } from '@tether/db/src/types'
import {  useState, type FC } from 'react'
import { Skeleton } from './ui/skeleton'
import GroupCard from './dashboard/group/GroupCard'

interface GroupListProps {
    groups: Group[]
    isLoading: boolean
}

const GroupList: FC<GroupListProps> = ({ groups, isLoading }) => {

    const { isAuthLoading } = useAuth();
    const [input, setInput] = useState("")

 
    const filteredChats = groups?.filter((group) =>
        group.name.toLowerCase().includes(input.toLowerCase())
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
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className='w-full h-14 mb-1 bg-foreground/20 ' />
                    ))
                    :
                    filteredChats &&
                        filteredChats.length > 0 ?
                        filteredChats.map((group) => (
                            <GroupCard group={group} key={group.id} />
                        ))
                        :
                        <p className='ml-4 mt-4'>Group list is empty</p>

            }
        </div>
    )
}

export default GroupList