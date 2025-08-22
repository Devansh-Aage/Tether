import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import type { ChatApiData, ChatData, Message, UserData } from '@tether/db/src/types'
import axios from 'axios'
import { format } from 'date-fns'
import { useEffect, useRef, type FC } from 'react'
import socket from '@/lib/socket'
import { GOT_NEW_MSG } from '@tether/common/src/eventConstants'

interface FriendMsgsProps {
    friendshipId: string
}

const MESSAGE_LIMIT = 200

const formatTimeStamp = (timeStamp: Date) => {
    return format(timeStamp, "HH:mm");
};

const FriendMsgs: FC<FriendMsgsProps> = ({ friendshipId }) => {
    const queryClient = useQueryClient()
    const { userId } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async ({ pageParam }: { pageParam?: unknown }) => {
        const res = await axios.get(
            `${import.meta.env.VITE_HTTP_URL}helper/frnd-chats/${friendshipId}`,
            {
                params: {
                    cursor: pageParam,
                    limit: MESSAGE_LIMIT,
                },
                withCredentials: true,
            }
        );
        return res.data;
    };

    const {
        data,
        isFetching,
        isSuccess,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isError,
        isLoading,
    } = useInfiniteQuery<ChatApiData, Error>({
        queryKey: [friendshipId, "chats",],
        queryFn: ({ pageParam }) => {
            return fetchMessages({ pageParam });
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    });

    const handleScroll = () => {
        if (
            containerRef.current &&
            containerRef.current.scrollTop <= 0 &&
            hasNextPage &&
            !isFetching &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    };

    useEffect(() => {
        const incomingFrndMsgHandler = (newMsg: Message) => {
            queryClient.setQueryData<ChatData>(
                [friendshipId, "chats"],
                (old) => {
                    if (old) {
                        return {
                            ...old,
                            pages: old.pages.map((page, idx) =>
                                idx === 0
                                    ? {
                                        ...page,
                                        messages: [newMsg, ...page.messages],
                                    }
                                    : page
                            ),
                        }
                    }
                    return {
                        pageParams: [undefined],
                        pages: [
                            {
                                messages: [newMsg],
                                friend: {} as UserData,
                                user: {} as UserData,
                                nextCursor: null
                            }
                        ]
                    }
                }
            );
        };
        socket.on(GOT_NEW_MSG, incomingFrndMsgHandler)
        return (() => {
            socket.off(GOT_NEW_MSG, incomingFrndMsgHandler)
        })
    }, [])

    const messages = data?.pages.flatMap((messages) => messages.messages) ?? []

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ "behavior": "smooth" })
        }
    }, [])


    if (isLoading) {
        return <p>Loading...</p>
    }
    if (isError) {
        return <p>Error loading messages</p>;
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex flex-col-reverse p-2 flex-1 w-full h-screen overflow-y-auto scrollbar-thin z-0 overflow-x-clip"
        >
            <div ref={messagesEndRef} />
            {isSuccess && messages.length > 0 ?
                messages.map((message, index) => {
                    const isCurrentUser = message.senderId === userId;
                    const hasNextMessageFromSameUser =
                        messages[index - 1]?.senderId === messages[index].senderId;
                    return (
                        <div
                            key={`${message.id}`}
                            className={cn("flex items-end ", {
                                "justify-end": isCurrentUser,
                            })}
                        >
                            <div
                                className={cn("flex space-y-2 max-w-lg mx-2 px-3 py-2 rounded-lg my-[2px] break-words relative pr-5 pb-4",
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
                                <span className="ml-2 absolute bottom-0.5 right-1.5 text-[10px] dark:text-slate-300 text-gray-800">
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