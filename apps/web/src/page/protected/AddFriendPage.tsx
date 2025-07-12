import { type FC } from 'react'
import FriendReq from '@/components/dashboard/add-friend/FriendReq';
import AddFriend from '@/components/dashboard/add-friend/AddFriend';

interface AddFriendPageProps {

}

const AddFriendPage: FC<AddFriendPageProps> = ({ }) => {
    return (
        <div className='flex-1 p-7'>
            <AddFriend />
            <p className='text-2xl mt-5 mb-2'>Incoming Friend Requests</p>
            <FriendReq />
        </div>
    )
}

export default AddFriendPage