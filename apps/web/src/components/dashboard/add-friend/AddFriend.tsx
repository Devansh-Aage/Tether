import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type FC } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { sendFriendReq } from "@tether/common/src/zodWsSchemas"
import { ADD_FRIEND, FRIEND_REQUEST_RESPONSE } from "@tether/common/src/eventConstants"
import socket from '@/lib/socket';
import { cn } from '@/lib/utils';

interface AddFriendProps {

}

type FormData = z.infer<typeof sendFriendReq>;

const AddFriend: FC<AddFriendProps> = ({ }) => {
    const [responseTxt, setresponseTxt] = useState("")
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(sendFriendReq),
    });

    useEffect(() => {
        const handler = (data: string) => {
            setresponseTxt(data)
        };
        socket.on(FRIEND_REQUEST_RESPONSE, handler);

        return () => {
            socket.off(FRIEND_REQUEST_RESPONSE, handler);
        };
    }, [])

    const onSubmit = (data: FormData) => {
        reset()
        socket.emit(ADD_FRIEND, { receiverEmail: data.receiverEmail })

    }

    return (
        <>
            <p className='text-2xl'>Send Friend Request</p>
            <form action="" onSubmit={handleSubmit(onSubmit)} className='w-xl flex items-center justify-start gap-3 mt-2'>
                <input {...register("receiverEmail")} type="text" placeholder='Enter Email' className={
                    cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-sm min-w-0 rounded-md border bg-transparent px-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-action/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    )}
                />
                <Button className='' type='submit' variant="tether">Send</Button>
            </form>
            <p className="text-sm text-red-700">{errors.receiverEmail?.message}</p>
            {
                responseTxt && <p className='text-cyan-700'>{responseTxt}</p>
            }
        </>
    )
}

export default AddFriend