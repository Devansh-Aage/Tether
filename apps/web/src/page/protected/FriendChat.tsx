import Avatar from '@/components/avatar';
import FriendMilestones from '@/components/dashboard/friend-chat/FriendMilestones';
import FriendTasks from '@/components/dashboard/friend-chat/FriendTasks';
import { type FC } from 'react'
import { useLocation, useParams } from 'react-router'

interface FriendChatProps {

}

const FriendChat: FC<FriendChatProps> = ({ }) => {
    const { friendshipId } = useParams()
    const location = useLocation();
    const state = location.state;
    const { friendImg, friendName, friendId } = state;

    return (
        <div key={friendshipId} className='flex-1 p-3 flex'>
            <div className='flex-1 flex flex-col'>
                <div className='flex items-center gap-5'>
                    {
                        friendImg ?
                            <Avatar imgLink={friendImg} />
                            :
                            <Avatar username={friendName} />
                    }
                    <p>{friendName}</p>
                </div>
            </div>
            <div className='w-sm py-4 px-2 flex flex-col gap-3 '>
                <FriendTasks friendId={friendId} />
                <FriendMilestones friendId={friendId} />
            </div>
        </div>
    )
}

export default FriendChat