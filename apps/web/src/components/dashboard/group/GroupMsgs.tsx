import { useEffect, useRef, type FC } from 'react';
import { format } from 'date-fns';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { GroupChats, GroupMember, GroupMessage, GroupMsgsData } from '@tether/db/src/types';
import axios from 'axios';
import { cn } from '@/lib/utils';
import Avatar from '@/components/avatar';
import socket from '@/lib/socket';
import { GOT_NEW_MSG_GRP } from '@tether/common/src/eventConstants';

interface GroupMsgsProps {
    groupId: string;
    members: GroupMember[];
}

const MESSAGE_LIMIT = 200

const formatTimeStamp = (timeStamp: string | Date) => {
    return format(new Date(timeStamp), "HH:mm");
};

const GroupMsgs: FC<GroupMsgsProps> = ({ groupId, members }) => {
    const queryClient = useQueryClient()
    const { userId } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const memberRecord: Record<string, GroupMember> = members.reduce((acc, member) => {
        acc[member.id] = { ...member };
        return acc
    }, {} as Record<string, GroupMember>
    )

    const fetchMessages = async ({ pageParam }: { pageParam?: unknown }) => {
        const res = await axios.get(
            `${import.meta.env.VITE_HTTP_URL}helper/get-group-chats/${groupId}`,
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
    } = useInfiniteQuery<GroupChats, Error>({
        queryKey: [groupId, "chats",],
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
        const incomingFrndMsgHandler = (newMsg: GroupMessage) => {
            queryClient.setQueryData<GroupMsgsData>([groupId, "chats"],

                (previousChats) => {
                    if (previousChats) {
                        return {
                            ...previousChats,
                            pages: previousChats.pages.map((page, idx) =>
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
                                nextCursor: null,
                            },
                        ],
                    };

                })
        };
        socket.on(GOT_NEW_MSG_GRP, incomingFrndMsgHandler)
        return (() => {
            socket.off(GOT_NEW_MSG_GRP, incomingFrndMsgHandler)
        })
    }, [])

    const messages = data?.pages.flatMap((messages) => messages.messages) ?? [];

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ "behavior": "smooth" })
        }
    }, [])

    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (isError) {
        return <p>Error loading messages</p>;
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex flex-col-reverse p-2 flex-1 w-full h-screen overflow-y-auto scrollbar-thin z-0"
        >
            <div ref={messagesEndRef} />
            {isSuccess && messages.length > 0 ? (
                messages.map((message, index) => {
                    const isCurrentUser = message.senderId === userId;
                    const hasNextMessageFromSameUser =
                        messages[index - 1]?.senderId === messages[index].senderId;
                    const sender = memberRecord[message.senderId]
                    return (
                        <div
                            key={message.id}
                            className={cn("flex items-end", {
                                "justify-end": isCurrentUser,
                            })}
                        >
                            <div className={
                                cn(
                                    "flex items-end",
                                )
                            }>
                                <div
                                    className={cn(
                                        "flex flex-col max-w-xs mx-2 px-3 py-2 rounded-lg my-[2px] break-words relative pr-5 pb-4",
                                        {
                                            "dark:bg-cyan-800 bg-cyan-400 ": isCurrentUser,
                                            "dark:bg-gray-800 bg-slate-200 ": !isCurrentUser,
                                        },
                                        {
                                            "rounded-br-none": !hasNextMessageFromSameUser && isCurrentUser,
                                            "rounded-bl-none": !hasNextMessageFromSameUser && !isCurrentUser,
                                        },
                                        { "order-2": !isCurrentUser },
                                        { "order-1": isCurrentUser }
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs text-action font-bold",
                                        { "hidden": isCurrentUser }
                                    )}>
                                        {sender.username}
                                    </span>
                                    <span className='text-base'>
                                        {message.text}{" "}
                                    </span>
                                    <span className="ml-2 absolute bottom-0.5 right-1.5 text-[9px] dark:text-slate-300 text-gray-800">
                                        {formatTimeStamp(message.timestamp)}
                                    </span>
                                </div>
                                <span className={cn(
                                    { "invisible": hasNextMessageFromSameUser },
                                    { "order-1": !isCurrentUser },
                                    { "order-2": isCurrentUser }
                                )}>
                                    {
                                        sender.profileImg ?
                                            <Avatar className='size-7' imgLink={sender.profileImg} />
                                            :
                                            <Avatar className='size-7 text-sm' username={sender.username} />
                                    }
                                </span>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div>No Chat</div>
            )}
        </div>
    );
};

export default GroupMsgs;