import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import socket from '@/lib/socket'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { SEND_MSG_REQ } from '@tether/common/src/eventConstants'
import type { ChatData, UserData } from '@tether/db/src/types'
import { SendHorizontal } from 'lucide-react'
import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface FriendChatInputProps {
    receiverId: string;
    friendshipId: string;
}

const sendMsgValidation = z.object({
    text: z.string().min(1, "Message can't be null")
})

type FormData = z.infer<typeof sendMsgValidation>

const FriendChatInput: FC<FriendChatInputProps> = ({ friendshipId, receiverId }) => {
    const { userId } = useAuth()
    const queryClient = useQueryClient()
    const {
        register,
        handleSubmit,
        watch,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(sendMsgValidation),
    });

    const onSubmit = async (data: FormData) => {
        const newMsg = {
            id: "temp-" + Date.now(),
            text: data.text,
            senderId: userId ?? "3g3g3g33",
            receiverId: receiverId,
            friendshipId: friendshipId,
            timestamp: new Date(),
            isSeen: false,
            isSent: false,
            media: null
        }
        reset()
        await queryClient.cancelQueries({ queryKey: [friendshipId, "chats"] })

        const previousChats = queryClient.getQueryData<{ chatData: ChatData }>([friendshipId, "chats"])

        if (previousChats) {
            queryClient.setQueryData<{ chatData: ChatData }>([friendshipId, "chats"],
                (old) => {

                    if (!old) {
                        return {
                            chatData: {
                                messages: [newMsg],
                                friend: {} as UserData,
                                user: {} as UserData
                            }
                        }
                    }

                    return {
                        ...old,
                        chatData: {
                            ...old.chatData,
                            messages: [
                                newMsg,
                                ...previousChats.chatData.messages,
                            ]
                        }
                    }
                })
        }

        socket.emit(SEND_MSG_REQ, {
            senderId: userId,
            receiverId: receiverId,
            text: data.text,
            friendshipId: friendshipId,
        })

        queryClient.invalidateQueries({ queryKey: [friendshipId, "chats"] })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex gap-3 items-center'>
            <input
                {...register('text')}
                className={cn("file:text-foreground mt-1 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-[3px]  focus-visible:ring-action/50 ",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                )}
                placeholder='Message' />
            <Button disabled={watch('text', '').trim().length == 0} type='submit' className='p-4 w-16' variant={'tether'}>{<SendHorizontal size={35} />}</Button>
        </form>
    )
}

export default FriendChatInput