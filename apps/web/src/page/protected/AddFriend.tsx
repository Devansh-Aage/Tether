import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type FC } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { sendFriendReq } from "@tether/common/src/zodWsSchemas"
import { ADD_FRIEND, FRIEND_REQUEST_RESPONSE } from "@tether/common/src/eventConstants"
import socket from '@/lib/socket';
import FriendReq from '@/components/dashboard/FriendReq';

interface AddFriendProps {

}

type FormData = z.infer<typeof sendFriendReq>;

const AddFriend: FC<AddFriendProps> = ({ }) => {
    const [responseTxt, setresponseTxt] = useState("")
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(sendFriendReq),
    });

    useEffect(() => {
        const handler = (data: string) => {
            setresponseTxt(data)
        };
        socket.once(FRIEND_REQUEST_RESPONSE, handler);

        return () => {
            socket.off(FRIEND_REQUEST_RESPONSE, handler);
        };
    }, [])

    const onSubmit = (data: FormData) => {
        socket.emit(ADD_FRIEND, { receiverEmail: data.receiverEmail })
    }


    return (
        <div className='flex-1 p-7'>
            <p className='text-2xl'>Send Friend Request</p>
            <form action="" onSubmit={handleSubmit(onSubmit)} className='w-xl flex items-center gap-3'>
                <input {...register("receiverEmail")} type="text" placeholder='Enter Email' className='bg-inputBg rounded-md py-1 px-2 my-3 border dark:border-white border-black focus:border-transparent ring-transparent ring-2 focus:ring-action w-sm ' />
                <Button className='' type='submit' variant="tether">Send</Button>
            </form>
            <p className="text-sm text-red-700">{errors.receiverEmail?.message}</p>
            {
                responseTxt && <p className='text-cyan-700'>{responseTxt}</p>
            }
            <p className='text-2xl mt-5 mb-2'>Incoming Friend Requests</p>
            <FriendReq />
        </div>
    )
}

export default AddFriend