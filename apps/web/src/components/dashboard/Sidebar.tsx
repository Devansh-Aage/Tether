import { useEffect, useState, type FC } from 'react'
import SideLink from './SideLink'
import { ClipboardPenLine, LogOut, Moon, Sun, UserPlus } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import axios from "axios"
import { type FriendRequest, type User } from "@tether/db/src/types"
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { useAuth } from '@/context/AuthContext'
import Avatar from '../avatar'
import { useTheme } from '../theme-provider'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { INCOMING_FRIEND_REQUEST } from '@tether/common/src/eventConstants'
import socket from '@/lib/socket'
import { useLocation } from 'react-router'


interface SidebarProps {

}

const Sidebar: FC<SidebarProps> = ({ }) => {
    const { logout } = useAuth()
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const [friendReqCount, setFriendReqCount] = useState<number>()
    const { data, isLoading } = useQuery({
        queryKey: ["userData"],
        queryFn: async (): Promise<{ user: User }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}auth/get-user`, {
                withCredentials: true
            });
            return res.data
        }
    });

    useEffect(() => {
        const incomingFrndReqHandler = (_data: FriendRequest) => {
            setFriendReqCount((prev) => prev || 0 + 1)
        }
        socket.on(INCOMING_FRIEND_REQUEST, incomingFrndReqHandler)
        return (() => {
            socket.off(INCOMING_FRIEND_REQUEST, incomingFrndReqHandler)
        })
    }, [])

    useEffect(() => {
        if (location.pathname.includes("/add-friend")) {
            setFriendReqCount(undefined)
        }
    }, [location])

    return (
        <div className='w-16 h-full font-nunito bg-cyan-300 dark:bg-cyan-950 flex flex-col justify-between items-center'>
            <div className=''>
                <p className='font-semibold text-3xl mt-5 mb-10 text-center'>T</p>
                <div className='flex flex-col gap-3 '>
                    <SideLink unseenReqCount={friendReqCount} to="/dashboard/add-friend" icon={<UserPlus size={20} />} text='Add Friend' />
                    <SideLink to="/dashboard/add-task" icon={<ClipboardPenLine size={20} />} text='Add Task' />
                </div>
            </div>
            <div className='pb-5'>
                {
                    isLoading ?
                        <Skeleton className='rounded-full size-10' />
                        :
                        <Popover>
                            <PopoverTrigger >
                                <Avatar username={data?.user.username!} />
                            </PopoverTrigger>
                            <PopoverContent className='py-2 px-3 max-w-[200px] font-medium'>
                                <div>
                                    <div>
                                        {data?.user.username}
                                    </div>
                                    <div className='text-foreground/80 font-light'>
                                        {data?.user.email}
                                    </div>
                                    <Separator className='my-2' />
                                    <div className='text-foreground/80 flex justify-between items-center'>
                                        <p className='text-foreground/80 text-sm'>Theme</p>
                                        <Button variant={'outline'} className='size-7'
                                            onClick={() => {
                                                theme === "dark" ?
                                                    setTheme('light') : setTheme("dark")
                                            }}>
                                            {
                                                theme === "dark" ?
                                                    <Moon size={5} className="" />
                                                    :
                                                    <Sun size={5} className="" />
                                            }
                                        </Button>
                                    </div>
                                </div>
                                <Separator className='my-2' />
                                <div>
                                    <Button variant={'ghost'} onClick={logout} size="sm" className='flex items-center justify-between w-full'>
                                        Log Out
                                        <LogOut />
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                }
            </div>
        </div>
    )
}

export default Sidebar