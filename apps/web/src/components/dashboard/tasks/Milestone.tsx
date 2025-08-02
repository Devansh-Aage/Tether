import { useState, type FC } from 'react'
import MilestoneCard from './MilestoneCard'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DialogContent, DialogDescription, DialogHeader, Dialog, DialogTitle } from '@/components/ui/dialog'
import InputTether from '@/components/ui/InputTether'
import { Textarea } from '@/components/ui/textarea'
import type { Milestone } from '@tether/db/src/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Skeleton } from '@/components/ui/skeleton'
import { zodResolver } from '@hookform/resolvers/zod'
import { addMilestone } from '@tether/common/src/zodHttpSchemas'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'

interface MilestoneCompProps {

}

type FormData = z.infer<typeof addMilestone>

const MilestoneComp: FC<MilestoneCompProps> = ({ }) => {
    const { userId } = useAuth()
    const [dialogOpen, setDialogOpen] = useState(false)
    const { data, isLoading } = useQuery({
        queryKey: ["milestone"],
        queryFn: async (): Promise<{ milestones: Milestone[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}milestone/fetch`, {
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
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(addMilestone),
    });

    const addMilestoneFn = useMutation({
        mutationFn: (data: FormData) => axios.post(`${import.meta.env.VITE_HTTP_URL}milestone/create`, {
            title: data.title,
            description: data.description,
            deadline: data.deadline.toISOString()
        }, {
            withCredentials: true
        }),
        onMutate: async (data: FormData) => {
            reset()
            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['milestone'] })

            // Snapshot the previous value
            const previousMilestones = queryClient.getQueryData<{ milestones: Milestone[] }>(['milestone'])

            // Optimistically update to the new value
            if (previousMilestones) {
                queryClient.setQueryData<{ milestones: Milestone[] }>(['milestone'], {
                    milestones: [
                        ...previousMilestones.milestones,
                        {
                            id: "temp-" + Date.now(),
                            title: data.title,
                            isDone: false,
                            userId: userId ?? "3g3g3g33",
                            description: data.description,
                            deadline: data.deadline
                        }
                    ]
                })
            }
            return { previousMilestones }
        },

        onError: (err, _variables, context) => {
            if (context?.previousMilestones) {
                queryClient.setQueryData(['milestone'], context.previousMilestones)
            }
            if (err instanceof z.ZodError) {
                setError("title", { message: err.message });
                setError("description", { message: err.message });
                setError("deadline", { message: err.message });
                return;
            }
            else {
                console.error("Failed to create milestone: ", err)
                toast.error("An unexpected error occurred!")
            }
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['milestone'] })
        },
        onSuccess: () => setDialogOpen(false)
    })

    const onSubmit = async (data: FormData) => {
        addMilestoneFn.mutate(data)
    }

    const deleteMilestoneMutation = useMutation({
        mutationFn: (milestoneId) => axios.delete(`${import.meta.env.VITE_HTTP_URL}milestone/delete/${milestoneId}`, {
            withCredentials: true
        }),
        onMutate: async (milestoneId: string) => {
            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['milestone'] })

            // Snapshot the previous value
            const previousMilestones = queryClient.getQueryData<{ milestones: Milestone[] }>(['milestone'])

            // Optimistically update to the new value
            if (previousMilestones) {
                queryClient.setQueryData<{ milestones: Milestone[] }>(['milestone'], {
                    milestones: previousMilestones.milestones.filter((m) => m.id !== milestoneId)
                })
            }
            return { previousMilestones }
        },

        onError: (err, _variables, context) => {
            if (context?.previousMilestones) {
                queryClient.setQueryData(['milestone'], context.previousMilestones)
            }
            else {
                console.error("Failed to delete milestone: ", err)
                toast.error("An unexpected error occurred!")
            }
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['milestone'] })
        }
    })

    return (
        <div className='px-4 py-2 mt-3 w-full rounded-xl'>
            <div className='flex items-center justify-between mb-2'>
                <p className='text-xl font-medium '>Milestones</p>
                <Button onClick={() => setDialogOpen(true)} variant={'tether'}>
                    Add Milestone
                </Button>
            </div>
            <ScrollArea className='h-[300px]'>
                <div className='py-2 px-4'>
                    {isLoading ?
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className='w-full h-16 mb-1 bg-foreground/20 ' />
                        ))
                        :
                        data?.milestones && data?.milestones.length > 0 ?
                            data?.milestones.map((milestone) => (
                                <MilestoneCard key={milestone.id} milestone={milestone} handleDeleteMilestone={deleteMilestoneMutation.mutate} />
                            ))
                            :
                            <p>No milestones added yet.</p>
                    }
                </div>
            </ScrollArea>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add Milestone
                        </DialogTitle>
                        <DialogDescription>
                            Complete milestone before deadline to receive rewards.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
                        <InputTether {...register('title')} error={errors.title?.message} htmlFor='title' title='Title' />
                        <Textarea {...register('description')} error={errors.description?.message} label='Description' id='desc' title='Description' />
                        {/* <InputTether {...register('deadline')} error={errors.deadline?.message} htmlFor='deadline' title='Deadline' /> */}
                        <Controller
                            control={control}
                            name="deadline"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className='flex flex-col gap-1'>
                                            <label htmlFor="deadline" className='text-black dark:text-white text-sm font-medium' >Deadline</label>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                            {errors.deadline && <p className="text-sm text-red-700 mt-1">{errors.deadline.message}</p>}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={new Date(field.value)}
                                            onSelect={(date) => field.onChange(date?.toISOString())}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        <Button disabled={isSubmitting} className='w-full' type="submit" variant={'tether'}>Add Milestone</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default MilestoneComp