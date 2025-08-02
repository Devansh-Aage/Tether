import Avatar from '@/components/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import type { UserData } from '@tether/db/src/types'
import {  type FC } from 'react'

interface SelectFriendCardProps {
    friend: UserData;
    isSelected: boolean
    handleCheckedChange: (isSelected: boolean, friendId: string) => void
}

const SelectFriendCard: FC<SelectFriendCardProps> = ({ friend, isSelected, handleCheckedChange }) => {
    return (
        <div className={`flex items-center gap-4 p-1 px-3 rounded-md ${isSelected && "dark:bg-cyan-800/50 bg-cyan-200"}`}>
            <Checkbox checked={isSelected}
                onCheckedChange={(checked) => handleCheckedChange(Boolean(checked), friend.id)} className='cursor-pointer' />
            <div className='flex items-center gap-3'>
                {
                    friend.profileImg ?
                        <Avatar className='size-8' imgLink={friend.profileImg} />
                        :
                        <Avatar className='size-8 text-base' username={friend.username} />
                }
                <div className='flex-1 min-w-0'>
                    <p className='font-semibold'>{friend.username}</p>
                </div>
            </div>
        </div>
    )
}

export default SelectFriendCard