import Avatar from '@/components/avatar'
import type { Group } from '@tether/db/src/types'
import { type FC } from 'react'
import { useLocation, useNavigate } from 'react-router'

interface GroupCardProps {
    group: Group
}

const GroupCard: FC<GroupCardProps> = ({ group }) => {
    const navigate = useNavigate()
    const handleClick = () => {
        navigate(`grp-chat/${group.id}`, {
            state: {
                grpName: group.name,
                grpImg: group.groupImg,
                grpCreatorId: group.creatorId
            }
        })
    }
    const location = useLocation();
    const pathname = location.pathname.split('/');
    const isActive = pathname.includes(group.id)
    return (
        <div onClick={handleClick} className={`w-full flex gap-4 items-center py-2 px-3 cursor-pointer  ${isActive ? "dark:bg-cyan-800/50 bg-cyan-200" : "hover:bg-cyan-100 dark:hover:bg-cyan-950/60"}`}>
            {
                group.groupImg ?
                    <Avatar className='size-9' imgLink={group.groupImg} />
                    :
                    <Avatar className='size-9' username={group.name} />
            }
            <div className='flex-1 min-w-0'>
                <p className='font-semibold'>{group.name}</p>
                {/* <p className='text-sm truncate'>Last text:shshhsh Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro, in fugiat numquam alias possimus molestias? Natus expedita aspernatur maxime odit?</p> */}
            </div>
        </div>
    )
}

export default GroupCard