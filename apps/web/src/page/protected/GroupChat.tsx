import GroupChatInput from '@/components/dashboard/group/GroupChatInput';
import GroupHeader from '@/components/dashboard/group/GroupHeader';
import GroupMsgs from '@/components/dashboard/group/GroupMsgs';
import { useAuth } from '@/context/AuthContext';
import socket from '@/lib/socket';
import { useQuery } from '@tanstack/react-query';
import { REMOVED_FROM_GROUP } from '@tether/common/src/eventConstants';
import type { GroupData } from '@tether/db/src/types';
import axios from 'axios';
import { useEffect, type FC } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

interface GroupChatProps {

}

const GroupChat: FC<GroupChatProps> = ({ }) => {
    const { userId } = useAuth()
    const { groupId } = useParams()
    const location = useLocation();
    const state = location.state;
    const { grpName, grpImg, grpCreatorId } = state;
    const router = useNavigate()

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: [groupId, "data"],
        queryFn: async (): Promise<{ grpChatData: GroupData }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/get-group-data/${groupId}`, {
                withCredentials: true
            })
            return { grpChatData: res.data }
        },
    })

    useEffect(() => {
        const incomingRemovedFromGrpHandler = () => {
            router("/dashboard")
        }
        socket.on(REMOVED_FROM_GROUP, incomingRemovedFromGrpHandler)
        return (() => {
            socket.off(REMOVED_FROM_GROUP, incomingRemovedFromGrpHandler)
        })
    }, [])

    if (isLoading) {
        return <p>Loading...</p>
    }
    const isCreator = userId === grpCreatorId;

    if (isSuccess) {
        return (
            <div key={groupId} className='flex-1 p-3 flex flex-col'>
                <GroupHeader groupId={groupId!} isCreator={isCreator} members={data.grpChatData.members} group={data.grpChatData.group ?? { grpName, grpImg }} />
                <GroupMsgs members={data.grpChatData.members} groupId={groupId!} />
                <GroupChatInput groupId={groupId!} />
            </div>
        )
    }


}

export default GroupChat