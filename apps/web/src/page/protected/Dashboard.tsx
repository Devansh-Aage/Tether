import Sidebar from "@/components/Sidebar"
import type { FC } from "react"


interface DashboardProps {

}

const Dashboard: FC<DashboardProps> = ({ }) => {
    return (
        <div className='text-white w-full h-screen font-nunito flex '>
            <Sidebar />
        </div>
    )
}

export default Dashboard