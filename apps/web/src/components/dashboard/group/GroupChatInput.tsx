import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { SendHorizontal, Smile } from 'lucide-react'
import { useEffect, useRef, useState, type FC, type FormEvent } from 'react'
import EmojiPicker from 'emoji-picker-react';
import type { GroupChats, GroupMessage, GroupMsgsData } from '@tether/db/src/types'
import socket from '@/lib/socket'
import { SEND_MSG_GRP_REQ } from '@tether/common/src/eventConstants'

interface GroupChatInputProps {
    groupId: string
}



const GroupChatInput: FC<GroupChatInputProps> = ({ groupId }) => {
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [input, setInput] = useState("")
    const { theme } = useTheme()
    const { userId } = useAuth()
    const queryClient = useQueryClient()

    const pickerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        const handleMouseDown = (e: MouseEvent) => {
            if (pickerRef.current &&
                !pickerRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)) {
                setEmojiOpen(false);
            }
        }

        document.addEventListener("mousedown", handleMouseDown)
        return () => {
            document.removeEventListener("mousedown", handleMouseDown)
        }
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (input.trim().length === 0) return;
        const newMsg = {
            id: "temp-" + Date.now(),
            groupId: groupId,
            text: input,
            senderId: userId ?? "3g3g3g33",
            timestamp: new Date(),
            media: null
        }

        await queryClient.cancelQueries({ queryKey: [groupId, "chats"] })
        setInput("")
        const previousChats = queryClient.getQueryData<GroupMsgsData>([groupId, "chats"])
        if (previousChats) {
            queryClient.setQueryData<GroupMsgsData>([groupId, "chats"],
                {
                    ...previousChats,
                    pages: previousChats.pages.map((page, idx) =>
                        idx === 0
                            ? {
                                ...page,
                                messages: [newMsg, ...page.messages],
                            }
                            : page
                    ),
                })
        }
        socket.emit(SEND_MSG_GRP_REQ, {
            senderId: userId,
            text: input,
            groupId: groupId,
        })
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: [groupId, "chats"] })
        }, 500);
    }

    return (
        <form onSubmit={handleSubmit} className='relative'>
            {
                emojiOpen &&
                <div ref={pickerRef} className='z-10 absolute -top-[29rem]'>
                    {/*@ts-ignore */}
                    <EmojiPicker onEmojiClick={(e) => setInput((prev) => prev + e.emoji)} theme={theme} lazyLoadEmojis />
                </div>
            }
            <div className='flex gap-3 items-center'>
                <div ref={buttonRef} className={`hover:text-cyan-400 cursor-pointer ${emojiOpen && "text-action"} transition-colors duration-200`} onClick={() => setEmojiOpen(!emojiOpen)}>
                    <Smile />
                </div>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={cn("file:text-foreground mt-1 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-[3px]  focus-visible:ring-action/50 ",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    )}
                    placeholder='Message' />
                <Button disabled={input.trim().length == 0} type='submit' className='p-4 w-16' variant={'tether'}>{<SendHorizontal size={35} />}</Button>
            </div>
        </form>
    )
}

export default GroupChatInput