import FriendsList from "@/components/dashboard/FriendsList"
import Sidebar from "@/components/dashboard/Sidebar"
import type { FC } from "react"
import { Outlet } from "react-router"


interface DashboardProps {
}

const Dashboard: FC<DashboardProps> = ({ }) => {
    return (
        <div className=' w-full h-screen font-nunito flex '>
            <Sidebar />
            <FriendsList />
            <Outlet />
        </div>
    )
}

export default Dashboard