import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChatData, Message, UserData } from '@tether/db/src/types'
import axios from 'axios'
import { format } from 'date-fns'
import { useEffect, useRef, type FC } from 'react'
import socket from '@/lib/socket'
import { GOT_NEW_MSG } from '@tether/common/src/eventConstants'

interface FriendMsgsProps {
    friendshipId: string
}

const formatTimeStamp = (timeStamp: Date) => {
    return format(timeStamp, "HH:mm");
};

const FriendMsgs: FC<FriendMsgsProps> = ({ friendshipId }) => {
    const queryClient = useQueryClient()
    const { userId } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ "behavior": "smooth" })
        }
    }, [data?.chatData.messages.length])


    if (isLoading) {
        return <p>Loading...</p>
    }
    return (
        <div
            className="flex flex-col-reverse p-2 flex-1 w-full h-screen overflow-y-auto scrollbar-thin"
        >
            <div ref={messagesEndRef} />
            {isSuccess && data.chatData.messages.length > 0 ?
                data.chatData.messages.map((message, index) => {
                    const isCurrentUser = message.senderId === userId;
                    const hasNextMessageFromSameUser =
                        data.chatData.messages[index - 1]?.senderId === data.chatData.messages[index].senderId;
                    return (
                        <div
                            key={`${message.id}`}
                            className={cn("flex items-end ", {
                                "justify-end": isCurrentUser,
                            })}
                        >
                            <div
                                className={cn("flex space-y-2 max-w-xs mx-2 px-3 py-2 rounded-lg my-[2px]",
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
                                <span className="ml-2 text-right self-end text-[11px] dark:text-slate-300 text-gray-800">
                                    {formatTimeStamp(message.timestamp)}
                                </span>
                            </div>
                        </div>
                    );
                })
                :
                <div>No Chat</div>
            }
        </div >
    )
}

export default FriendMsgs