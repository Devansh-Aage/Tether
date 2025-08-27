import Avatar from '@/components/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Friend, GroupMember, GroupMetadata } from '@tether/db/src/types'
import { useState, type FC } from 'react'
import SelectFriendCard from './SelectFriendCard'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import socket from '@/lib/socket'
import { ADD_IN_GROUP_REQ, REMOVE_FROM_GROUP_REQ } from '@tether/common/src/eventConstants'

interface GroupHeaderProps {
    group: GroupMetadata;
    groupId: string
    members: GroupMember[];
    isCreator: boolean
}

const GroupHeader: FC<GroupHeaderProps> = ({ group, members, isCreator, groupId }) => {
    const queryClient = useQueryClient()
    const [selectedFrndIds, setSelectedFrndIds] = useState<string[]>([])
    const [friendDialog, setFriendDialog] = useState(false)

    const { data } = useQuery({
        queryKey: ["friends", "addGroup"],
        queryFn: async (): Promise<{ friends: Friend[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/get-friends`, {
                withCredentials: true
            })
            return res.data
        },
    })

    const handleChange = (isSelected: boolean, friendId: string) => {
        setSelectedFrndIds((prev) => (
            isSelected ? [...prev, friendId]
                : prev.filter((id) => id !== friendId)))
    }
    const memberIds = members.map((m) => m.id);
    const friendsNotInGroup = data?.friends.filter((f) => {
        const isAdded = memberIds.includes(f.id);
        if (!isAdded) {
            return f
        }
        return
    })

    const addFriendInGroup = async () => {
        socket.emit(ADD_IN_GROUP_REQ, {
            groupId,
            memberIds: selectedFrndIds
        });
        setFriendDialog(false)
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: [groupId, "data"] });
            queryClient.invalidateQueries({ queryKey: ["friends", "addGroup"] });
        }, 500);
    }

    const removeMemberFromGroup = async (memberId: string) => {
        socket.emit(REMOVE_FROM_GROUP_REQ, {
            groupId,
            memberId: memberId
        });
        queryClient.invalidateQueries({ queryKey: [groupId, "chats"] });
        queryClient.invalidateQueries({ queryKey: [groupId, "data"] });
        queryClient.invalidateQueries({ queryKey: ["friends", "addGroup"] });
    }

    return (
        <div className="relative">
            <Popover>
                <PopoverTrigger asChild>
                    <div className="flex items-center gap-5 cursor-pointer">
                        {group.grpImg ? (
                            <Avatar imgLink={group.grpImg} />
                        ) : (
                            <Avatar username={group.grpName} />
                        )}
                        <p>{group.grpName}</p>
                    </div>
                </PopoverTrigger>

                <PopoverContent side='bottom' className="w-lg p-4 shadow flex flex-col gap-3 bg-secondry-background">
                    <div className='flex items-center justify-between'>
                        <p className='' >Members</p>
                        <Button onClick={() => setFriendDialog(!friendDialog)} variant={'tether'} size={'sm'} className='' >Add Member</Button>
                    </div>
                    <ScrollArea className='h-[150px]'>
                        {
                            members.map((member) => (
                                <div key={member.id} className='flex gap-2 mb-2 items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        {member.profileImg ? (
                                            <Avatar className='size-8 text-sm' imgLink={member.profileImg} />
                                        ) : (
                                            <Avatar className='size-8 text-sm' username={member.username} />
                                        )}
                                        <p>{member.username}</p>
                                        {
                                            member.isCreator &&
                                            <Badge className='bg-blue-600 text-white' >Creator</Badge>
                                        }
                                        {/* {
                                            member.isAdmin &&
                                            <Badge className='bg-blue-600 text-white' >Admin</Badge>
                                        } */}
                                    </div>
                                    {
                                        isCreator &&
                                        <Button onClick={() => removeMemberFromGroup(member.id)} variant={'link'} >Remove</Button>
                                    }
                                </div>
                            ))
                        }
                    </ScrollArea>
                </PopoverContent>
            </Popover>
            <Dialog open={friendDialog} onOpenChange={setFriendDialog} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add Member
                        </DialogTitle>
                        <DialogDescription>
                            Select friends to add to the group chat.
                        </DialogDescription>
                    </DialogHeader>
                    {
                        friendsNotInGroup &&
                            friendsNotInGroup?.length > 0 ?
                            <>
                                <p className=''>Friends:</p>
                                <ScrollArea className='w-full h-fit border border-foreground/20 rounded-lg'>
                                    <div className='p-1 flex flex-col gap-1'>
                                        {
                                            friendsNotInGroup?.map((friend) => (
                                                <SelectFriendCard handleCheckedChange={handleChange} isSelected={selectedFrndIds.includes(friend.id)} friend={friend} key={friend.id} />
                                            ))

                                        }
                                    </div>
                                </ScrollArea>
                                <Button onClick={() => addFriendInGroup()} disabled={selectedFrndIds.length === 0} variant={"tether"} type='submit' className='w-full mt-2' >Create Group</Button>
                            </>
                            :
                            <p>No more friends to add</p>
                    }
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default GroupHeader
