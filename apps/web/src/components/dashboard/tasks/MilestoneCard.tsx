import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Milestone } from '@tether/db/src/types';
import axios from 'axios';
import { Circle, CircleCheckBig, Trash2 } from 'lucide-react'
import { useState, type FC } from 'react'
import { toast } from 'sonner';

interface MilestoneCardProps {
    milestone: Milestone
    handleDeleteMilestone: (id: string) => void;
}

const MilestoneCard: FC<MilestoneCardProps> = ({ handleDeleteMilestone, milestone }) => {
    const [isDoneState, setIsDoneState] = useState<boolean>(milestone.isDone)

    const queryClient = useQueryClient()

    const completeMilestoneMutation = useMutation({
        mutationFn: () => axios.post(`${import.meta.env.VITE_HTTP_URL}milestone/complete/${milestone.id}`, {
        }, {
            withCredentials: true
        }),
        onMutate: () => setIsDoneState(true),

        onError: (err) => {
            console.error("Failed to complete milestone: ", err)
            toast.error("An unexpected error occurred!")
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['milestone'] })
        }
    })
    return (
        <div className='flex group items-center mb-3 justify-center gap-3' >
            <div
                onClick={() => !isDoneState && completeMilestoneMutation.mutate()}
                className={`flex flex-1 items-center px-3 py-2 bg-gradient-to-r from-cyan-200 dark:from-cyan-900 to-transparent rounded-lg cursor-pointer transition duration-300 ring-2 ring-transparent group-hover:ring-action`}
            >
                {
                    !isDoneState ?
                        <Circle />
                        :
                        <CircleCheckBig />
                }
                <div className='flex-1 ml-3 flex flex-col'>
                    <p
                        className={`text-lg ${isDoneState ? "line-through" : ""
                            }`}
                    >
                        {milestone.title}
                    </p>
                    <p className='text-foreground/70'>{milestone.description}</p>
                </div>
                <p className=' text-sm'>{new Date(milestone.deadline).toDateString()}</p>
            </div>
            <Button onClick={() => handleDeleteMilestone(milestone.id)} variant={'outline'} size={'icon'} className='p-3 rounded-lg group cursor-pointer hover:text-red-600'>
                <Trash2 size={25} className='' />
            </Button>
        </div>
    )
}

export default MilestoneCard