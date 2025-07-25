import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import type { Task } from '@tether/db/src/types'
import axios from 'axios'
import { type FC } from 'react'
import TasksCard from '../tasks/TasksCard'

interface FriendTasksProps {
    friendId: string
}

const FriendTasks: FC<FriendTasksProps> = ({ friendId }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["daily-task", friendId],
        queryFn: async (): Promise<{ tasks: Task[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}task/fetch-friend/${friendId}`, {
                withCredentials: true
            })
            return res.data
        },
    })
    return (
        <div>
            <p className='text-xl font-medium mb-1'>Daily Tasks</p>
            {
                isLoading ?
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className='w-full h-16 mb-1 bg-foreground/20 ' />
                    ))
                    :
                    data?.tasks && data?.tasks.length > 0 ?
                        data?.tasks.map((task) => (
                            <TasksCard isFriendCard={true} task={task} key={task.id} />
                        ))
                        :
                        <p>No daily tasks added yet.</p>
            }
        </div>
    )
}

export default FriendTasks