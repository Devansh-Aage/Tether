import { useQuery } from '@tanstack/react-query'
import type { Friend, Group } from '@tether/db/src/types'
import axios from 'axios'
import { type FC } from 'react'
import CreateGroup from './dashboard/group/CreateGroup'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import FriendsList from './dashboard/FriendsList'
import GroupList from './GroupList'

interface ChatListProps {

}

const ChatList: FC<ChatListProps> = ({ }) => {
    const { data, isLoading: isFrndsLoading, isSuccess: isFrndsSuccess } = useQuery({
        queryKey: ["userFriends"],
        queryFn: async (): Promise<{ friends: Friend[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/get-friends`, {
                withCredentials: true
            })
            return res.data
        },
    })

    const { data: grpData, isLoading: isGrpsLoading, isSuccess: isGrpsSuccess } = useQuery({
        queryKey: ["userGroups"],
        queryFn: async (): Promise<{ groups: Group[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/get-groups`, {
                withCredentials: true
            })
            return res.data
        },
    })

    return (
        <div className='w-[280px] h-full bg-light-bg dark:bg-dark-bg font-nunito'>
            <div className='flex items-center justify-between py-2 px-3'>
                <p className='text-xl font-semibold'>Chats</p>
                {isFrndsSuccess &&
                    <CreateGroup friends={data?.friends} />
                }
            </div>
            <div className='w-full'>
                <Tabs defaultValue='friends' className='w-full'>
                    <TabsList className='w-[95%] mx-auto'>
                        <TabsTrigger value='friends'>Friends</TabsTrigger>
                        <TabsTrigger value='groups'>Groups</TabsTrigger>
                    </TabsList>
                    <TabsContent value='friends' className='w-full'>
                        {
                            isFrndsSuccess &&
                            <FriendsList friends={data.friends} isLoading={isFrndsLoading} />
                        }
                    </TabsContent>
                    <TabsContent value='groups' className='w-full'>
                        {
                            isGrpsSuccess &&
                            <GroupList groups={grpData.groups} isLoading={isGrpsLoading} />
                        }
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ChatList