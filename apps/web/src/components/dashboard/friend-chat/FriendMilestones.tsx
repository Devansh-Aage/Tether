import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import type { Milestone } from '@tether/db/src/types'
import axios from 'axios'
import { type FC } from 'react'
import MilestoneCard from '../tasks/MilestoneCard'

interface FriendMilestonesProps {
    friendId: string
}

const FriendMilestones: FC<FriendMilestonesProps> = ({ friendId }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["milestone", friendId],
        queryFn: async (): Promise<{ milestones: Milestone[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}milestone/fetch-friend/${friendId}`, {
                withCredentials: true
            })
            return res.data
        },
    })
    return (
        <div>
            <p className='text-xl font-medium mb-1'>Milestones</p>
            {isLoading ?
                Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='w-full h-16 mb-1 bg-foreground/20 ' />
                ))
                :
                data?.milestones && data?.milestones.length > 0 ?
                    data?.milestones.map((milestone) => (
                        <MilestoneCard isFriendCard={true} key={milestone.id} milestone={milestone} />
                    ))
                    :
                    <p>No milestones added yet.</p>
            }
        </div>
    )
}

export default FriendMilestones