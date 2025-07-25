import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task } from '@tether/db/src/types'
import axios from 'axios'
import { Circle, CircleCheckBig, Trash2 } from 'lucide-react'
import { useState, type FC } from 'react'
import { toast } from 'sonner'

interface TasksCardProps {
    task: Task;
    handleDeleteTask: (id: string) => void;
}

const TasksCard: FC<TasksCardProps> = ({ task, handleDeleteTask }) => {
    const [isDoneState, setIsDoneState] = useState<boolean>(task.isDone)
    const queryClient = useQueryClient()

    const completeTaskMutation = useMutation({
        mutationFn: () => axios.post(`${import.meta.env.VITE_HTTP_URL}task/complete/${task.id}`, {
        }, {
            withCredentials: true
        }),
        onMutate: () => setIsDoneState(true),

        onError: (err) => {
            console.error("Failed to complete task: ", err)
            toast.error("An unexpected error occurred!")
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-task'] })
        }
    })
    return (
        <div className='flex group items-center mb-3 justify-center gap-3 w-[95% mx-auto]' >
            <div
                onClick={() => !isDoneState && completeTaskMutation.mutate()}
                className={`flex flex-1 items-center px-3 py-2 bg-gradient-to-r from-cyan-200 dark:from-cyan-900 to-transparent rounded-lg cursor-pointer transition duration-300 ring-2 ring-transparent group-hover:ring-action`}
            >
                {
                    !isDoneState ?
                        <Circle />
                        :
                        <CircleCheckBig />
                }
                <p
                    className={`flex-1 ml-3 text-base ${isDoneState ? "line-through" : ""
                        }`}
                >
                    {task.title}
                </p>
            </div>
            <Button onClick={() => handleDeleteTask(task.id)} variant={'outline'} size={'icon'} className='p-3 rounded-lg group cursor-pointer hover:text-red-600'>
                <Trash2 size={25} className='' />
            </Button>
        </div>
    )
}

export default TasksCard