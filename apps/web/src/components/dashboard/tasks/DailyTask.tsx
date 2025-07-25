import { useState, type FC } from 'react'
import TasksCard from './TasksCard'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DialogContent, DialogDescription, DialogHeader, Dialog, DialogTitle } from '@/components/ui/dialog'
import InputTether from '@/components/ui/InputTether'
import type { Task } from '@tether/db/src/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addTask } from '@tether/common/src/zodHttpSchemas'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface DailyTaskProps {}

type FormData = z.infer<typeof addTask>

const DailyTask: FC<DailyTaskProps> = ({ }) => {
    const { userId } = useAuth()
    const [dialogOpen, setDialogOpen] = useState(false)
    const { data, isLoading } = useQuery({
        queryKey: ["daily-task"],
        queryFn: async (): Promise<{ tasks: Task[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}task/fetch`, {
                withCredentials: true
            })
            return res.data
        },
    })
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(addTask),
    });

    const addDailyTaskMutation = useMutation({
        mutationFn: (newTaskTitle) => axios.post(`${import.meta.env.VITE_HTTP_URL}task/create`, {
            title: newTaskTitle
        }, {
            withCredentials: true
        }),
        onMutate: async (newTaskTitle: string) => {
            reset()
            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['daily-task'] })

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<{ tasks: Task[] }>(['daily-task'])

            // Optimistically update to the new value
            if (previousTasks) {
                queryClient.setQueryData<{ tasks: Task[] }>(['daily-task'], {
                    tasks: [
                        ...previousTasks.tasks,
                        {
                            id: "323sdsds",
                            title: newTaskTitle,
                            isDone: false,
                            userId: userId ?? "3g3g3g33"
                        }
                    ]
                })
            }
            return { previousTasks }
        },

        onError: (err, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['daily-task'], context.previousTasks)
            }
            if (err instanceof z.ZodError) {
                setError("title", { message: err.message });
                return;
            }
            else {
                console.error("Failed to create task: ", err)
                toast.error("An unexpected error occurred!")
            }
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-task'] })
        },
        onSuccess: () => setDialogOpen(false)
    })

    const onSubmit = async (data: FormData) => {
        addDailyTaskMutation.mutate(data.title)
    }

    const deleteTaskMutation = useMutation({
        mutationFn: (taskId) => axios.delete(`${import.meta.env.VITE_HTTP_URL}task/delete/${taskId}`, {
            withCredentials: true
        }),
        onMutate: async (taskId: string) => {
            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['daily-task'] })

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<{ tasks: Task[] }>(['daily-task'])

            // Optimistically update to the new value
            if (previousTasks) {
                queryClient.setQueryData<{ tasks: Task[] }>(['daily-task'], {
                    tasks: previousTasks.tasks.filter((t) => t.id !== taskId)
                })
            }
            return { previousTasks }
        },

        onError: (err, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['daily-task'], context.previousTasks)
            }
            else {
                console.error("Failed to delete task: ", err)
                toast.error("An unexpected error occurred!")
            }
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-task'] })
        }
    })


    return (
        <div className='px-4 py-2 w-full rounded-xl'>
            <div className='flex items-center justify-between mb-2'>
                <p className='text-xl font-medium '>Daily Tasks</p>
                <Button onClick={() => setDialogOpen(true)} variant={'tether'}>
                    Add Daily Task
                </Button>
            </div>
            <ScrollArea className='h-[200px]'>
                <div className='py-2 px-4'>
                    {isLoading ?
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className='w-full h-16 mb-1 bg-foreground/20 ' />
                        ))
                        :
                        data?.tasks && data?.tasks.length > 0 ?
                            data?.tasks.map((task) => (
                                <TasksCard handleDeleteTask={deleteTaskMutation.mutate} task={task} key={task.id} />
                            ))
                            :
                            <p>No daily tasks added yet.</p>
                    }
                </div>
            </ScrollArea>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add Daily Task
                        </DialogTitle>
                        <DialogDescription>
                            Daily tasks will be refreshed daily.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
                        <InputTether {...register('title')} error={errors.title?.message} htmlFor='title' title='Task Title' />
                        <Button disabled={isSubmitting} className='w-full' type="submit" variant={'tether'}>Add Daily Task</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DailyTask