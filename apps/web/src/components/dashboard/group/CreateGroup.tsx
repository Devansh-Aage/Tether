import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import InputTether from '@/components/ui/InputTether'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Group, UserData } from '@tether/db/src/types'
import { Plus, Users } from 'lucide-react'
import { useState, type FC } from 'react'
import SelectFriendCard from './SelectFriendCard'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { CREATE_GROUP_REQ } from '@tether/common/src/eventConstants'
import socket from '@/lib/socket'

interface CreateGroupProps {
  friends: UserData[]
}
const createGroupValidation = z.object({
  groupName: z.string().min(1, "Enter a valid group name").max(45, "Group name too long!")
})
type FormData = z.infer<typeof createGroupValidation>

const CreateGroup: FC<CreateGroupProps> = ({ friends }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedFrndIds, setSelectedFrndIds] = useState<string[]>([])
  const { userId } = useAuth()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createGroupValidation),
  });

  const handleChange = (isSelected: boolean, friendId: string) => {
    setSelectedFrndIds((prev) => (
      isSelected ? [...prev, friendId]
        : prev.filter((id) => id !== friendId)))
  }

  const isFormValid = selectedFrndIds.length >= 2

  const onSubmit = async (data: FormData) => {
    const newGrp = {
      id: "temp-" + Date.now(),
      name: data.groupName,
      creatorId: userId!,
      groupImg: null,
    }
    reset()
    await queryClient.cancelQueries({ queryKey: ["userGroups"] })

    const previousGroups = queryClient.getQueryData<{ groups: Group[] }>(["userGroups"])

    if (previousGroups) {
      queryClient.setQueryData<{ groups: Group[] }>(["userGroups"],
        {
          groups: [
            ...previousGroups.groups,
            newGrp
          ]
        })
    }

    socket.emit(CREATE_GROUP_REQ, {
      name: newGrp.name,
      creatorId: userId,
      memberIds: [...selectedFrndIds, userId]
    })
    setOpenDialog(false)

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["userGroups"] })

    }, 1500);


  }
  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog} >
        <DialogTrigger className='relative size-9 flex items-center justify-center hover:opacity-85 rounded-md dark:bg-cyan-800 bg-cyan-700 text-white cursor-pointer'>
          <Users size={18} />
          <Plus size={10} strokeWidth='3' className='absolute right-1 top-2' />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>
            Create a Group Chat
          </DialogTitle>
          <DialogDescription>
            Select Friends to create a group chat.
          </DialogDescription>
          <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
            <InputTether {...register("groupName")} error={errors.groupName?.message} htmlFor='groupName' title='Group Name' />
            <div className='py-2'>
              <p className='mb-1'>Members:</p>
              <ScrollArea className='w-full h-fit border border-foreground/20 rounded-lg'>
                <div className='p-1 flex flex-col gap-1'>
                  {
                    friends.map((friend) => (
                      <SelectFriendCard handleCheckedChange={handleChange} isSelected={selectedFrndIds.includes(friend.id)} friend={friend} key={friend.id} />
                    ))
                  }
                </div>
              </ScrollArea>
            </div>
            <Button disabled={!isFormValid} variant={"tether"} type='submit' className='w-full mt-2' >Create Group</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateGroup