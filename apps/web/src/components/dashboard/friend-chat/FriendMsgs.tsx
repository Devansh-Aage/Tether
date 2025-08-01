import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Message, UserData } from '@tether/db/src/types'
import axios from 'axios'
import { format } from 'date-fns'
import { useEffect, type FC } from 'react'
import socket from '@/lib/socket'
import { GOT_NEW_MSG } from '@tether/common/src/eventConstants'

interface FriendMsgsProps {
    friendshipId: string
}

interface ChatData {
    messages: Message[],
    friend: UserData,
    user: UserData
}

const formatTimeStamp = (timeStamp: Date) => {
    return format(timeStamp, "HH:mm");
};

const FriendMsgs: FC<FriendMsgsProps> = ({ friendshipId }) => {
    const queryClient = useQueryClient()
    const { userId } = useAuth()
    const { data, isLoading, isSuccess } = useQuery({
        queryKey: [friendshipId, "chats"],
        queryFn: async (): Promise<{ chatData: ChatData }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}helper/frnd-chats/${friendshipId}`, {
                withCredentials: true
            })
            return { chatData: res.data }
        },
    })

    useEffect(() => {
        const incomingFrndMsgHandler = (newMsg: Message) => {
            queryClient.setQueryData<{ chatData: ChatData }>(
                [friendshipId, "chats"],
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
                        chatData: {
                            ...old?.chatData,
                            messages: [newMsg, ...old.chatData.messages]
                        }
                    }
                }
            );
        };
        socket.on(GOT_NEW_MSG, incomingFrndMsgHandler)
        return (() => {
            socket.off(GOT_NEW_MSG, incomingFrndMsgHandler)
        })
    }, [])

    if (isLoading) {
        return <p>Loading...</p>
    }
    return (
        <div
            id="messages"
            className="flex flex-1 w-full flex-col-reverse h-full gap-1 p-3 overflow-y-auto"
        >
            {isSuccess && data.chatData.messages.length > 0 ?
                data.chatData.messages.map((message, index) => {
                    const isCurrentUser = message.senderId === userId;
                    const hasNextMessageFromSameUser =
                        data.chatData.messages[index - 1]?.senderId === data.chatData.messages[index].senderId;
                    return (
                        <div
                            key={`${message.id}-${message.timestamp}`}
                            className={cn("flex items-end ", {
                                "justify-end": isCurrentUser,
                            })}
                        >
                            <div
                                className={cn("flex flex-col space-y-2 max-w-xs mx-2")}
                            >
                                <span
                                    className={cn(
                                        "px-3 py-2 rounded-lg inline-block",
                                        {
                                            "dark:bg-cyan-800 bg-cyan-400 ": isCurrentUser,
                                            "dark:bg-gray-800 bg-slate-200 ": !isCurrentUser,
                                        },
                                        {
                                            "rounded-br-none": !hasNextMessageFromSameUser && isCurrentUser,
                                            "rounded-bl-none": !hasNextMessageFromSameUser && !isCurrentUser,
                                        }
                                    )}
                                >
                                    {message.text}{" "}
                                    <span className="ml-2 text-right align-bottom text-[11px] dark:text-slate-300 text-gray-800">
                                        {formatTimeStamp(message.timestamp)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })
                :
                <div>No Chat</div>
            }
        </div>
    )
}

export default FriendMsgs