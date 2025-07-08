import { type FC, type ReactNode } from 'react'
import { NavLink } from 'react-router'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
interface SideLinkProps {
    icon: ReactNode,
    text: string
}

const SideLink: FC<SideLinkProps> = ({ icon, text }) => {
    return (
        <Tooltip>
            <TooltipTrigger>
                <NavLink to="/test" className={({ isActive }) => `p-3 flex items-center justify-center hover:opacity-85 rounded-md ${isActive ? "bg-white text-dark-bg" : "bg-cyan-800 text-slate-200"}`}>
                    {icon}
                </NavLink>
            </TooltipTrigger>
            <TooltipContent side='right'>
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>

    )
}

export default SideLink