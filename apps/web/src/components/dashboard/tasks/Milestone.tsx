import { useState, type FC } from 'react'
import MilestoneCard from './MilestoneCard'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, Dialog, DialogTitle } from '@/components/ui/dialog'
import InputTether from '@/components/ui/InputTether'
import { Textarea } from '@/components/ui/textarea'
import type { Milestone } from '@tether/db/src/types'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Skeleton } from '@/components/ui/skeleton'
interface MilestoneProps {

}

const Milestone: FC<MilestoneProps> = ({ }) => {
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
                        data?.milestones && data?.milestones.length > 0 &&
                        data?.milestones.map((_, i) => (
                            <MilestoneCard key={i} />
                        ))
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
                    <div>
                        <InputTether htmlFor='title' title='Title' />
                        <Textarea label='Description' id='desc' title='Description' />
                        <InputTether htmlFor='deadline' title='Deadline' />
                    </div>
                    <DialogFooter>
                        <Button className='w-full' type="submit" variant={'tether'}>Add Milestone</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Milestone