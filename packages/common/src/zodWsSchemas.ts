import { z } from "zod";

export const sendFriendReq = z.object({
  senderId: z.string().uuid("Invalid ID"),
  receiverId: z.string().uuid("Invalid ID"),
});
