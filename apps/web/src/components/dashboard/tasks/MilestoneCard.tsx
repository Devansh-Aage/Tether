import { Button } from '@/components/ui/button'
import { Circle, CircleCheckBig, Trash2 } from 'lucide-react'
import { useState, type FC } from 'react'

interface MilestoneCardProps {

}

const MilestoneCard: FC<MilestoneCardProps> = ({ }) => {
    const [isDoneState, setisDoneState] = useState<boolean>(false)
    return (
        <div className='flex group items-center mb-3 justify-center gap-3' >
            <div
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
                        Test
                    </p>
                    <p className='text-foreground/70'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptatum labore dolorum est nulla alias perferendis temporibus quis necessitatibus animi fugiat.</p>
                </div>
                <p className=' text-sm'>18/7/2025</p>
            </div>
            <Button variant={'outline'} size={'icon'} className='p-3 rounded-lg group cursor-pointer hover:text-red-600'>
                <Trash2 size={25} className='' />
            </Button>
        </div>
    )
}

export default MilestoneCard