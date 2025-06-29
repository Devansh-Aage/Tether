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

export const sendMsg = z
  .object({
    senderId: z.string().uuid("Invalid ID"),
    receiverId: z.string().uuid("Invalid ID"),
    text: z.string().optional(),
    media: z.string().optional(),
    friendshipId: z.string().uuid("Invalid ID"),
  })
  .refine((data) => data.text || data.media, {
    message: "Message must contain either text or media content",
    path: ["text", "media"], // Shows both fields in error
  });

export const sentMessageSchema = z.object({
  status: z.literal(201),
  id: z.string().uuid("Invalid ID"),
});
