import DailyTask from '@/components/dashboard/tasks/DailyTask'
import Milestone from '@/components/dashboard/tasks/Milestone'
import useTitle from '@/hooks/useTitle'
import { type FC } from 'react'

interface TasksProps {

}

const Tasks: FC<TasksProps> = ({ }) => {
    useTitle("Tasks")
    return (
        <div className='flex-1 p-5'>
            <DailyTask />
            <Milestone />
        </div>
    )
}

export default Tasks