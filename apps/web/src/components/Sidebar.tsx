import { type FC } from 'react'
import SideLink from './SideLink'
import { ClipboardPenLine, UserPlus } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import axios from "axios"
import { type User } from "@tether/db/src/types"
import { Skeleton } from './ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'


interface SidebarProps {

}

const Sidebar: FC<SidebarProps> = ({ }) => {

    const { data, isLoading, isError, isSuccess } = useQuery({
        queryKey: ["userData"],
        queryFn: async (): Promise<{ user: User }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}auth/get-user`, {
                withCredentials: true
            });
            return res.data
        }
    })

    return (
        <div className='w-16 h-full font-nunito bg-light-bg dark:bg-dark-bg flex flex-col justify-between items-center'>
            <div className=''>
                <p className='font-semibold text-3xl mt-5 mb-10 text-center'>T</p>
                <div className='flex flex-col gap-3 '>
                    <SideLink icon={<UserPlus size={20} />} text='Add Friend' />
                    <SideLink icon={<ClipboardPenLine size={20} />} text='Add Task' />
                </div>
            </div>
            <div className='pb-5'>
                {
                    isLoading ?
                        <Skeleton className='rounded-full size-10' />
                        :
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className='size-10 cursor-pointer bg-pink-900 rounded-full flex items-center justify-center text-white text-lg'>{data?.user.username.charAt(0)}</div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>
                                        {data?.user.username}
                                    </DropdownMenuLabel>
                                    <DropdownMenuLabel className='text-xs'>
                                        {data?.user.email}
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className='mb-2' />
                                <DropdownMenuGroup>
                                    <Button size="sm" className='bg-red-500 hover:bg-red-700 text-white w-full'>
                                        Sign out
                                    </Button>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                }
            </div>
        </div>
    )
}

export default Sidebar