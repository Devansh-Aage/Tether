import { z } from "zod";

export const sendFriendReq = z.object({
  senderId: z.string().uuid("Invalid ID"),
  receiverId: z.string().uuid("Invalid ID"),
});

export const acceptOrDenyFriendReq = z.object({
  id: z.string().uuid("Invalid ID"),
  senderId: z.string().uuid("Invalid ID"),
  receiverId: z.string().uuid("Invalid ID"),
});


