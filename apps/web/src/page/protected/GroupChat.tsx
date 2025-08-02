import Avatar from '@/components/avatar';
import { type FC } from 'react'
import { useLocation, useParams } from 'react-router'

interface GroupChatProps {

}

const GroupChat: FC<GroupChatProps> = ({ }) => {
    const { groupId } = useParams()
    const location = useLocation();
    const state = location.state;
    const { grpName, grpImg, grpCreatorId } = state;
    return (
        <div key={groupId} className='flex-1 p-3 flex flex-col'>
            <div className='flex items-center gap-5'>
                {
                    grpImg ?
                        <Avatar imgLink={grpImg} />
                        :
                        <Avatar username={grpName} />
                }
                <p>{grpName}</p>
            </div>
            {/* <FriendMsgs friendshipId={friendshipId!} />
            <FriendChatInput friendshipId={friendshipId!} receiverId={friendId} /> */}
        </div>
    )
}

export default GroupChat