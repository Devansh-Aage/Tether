import { z } from "zod";

export const sendFriendReq = z.object({
  receiverEmail: z.string().email("Please enter a valid email!"),
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

export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name must have at least one character"),
  creatorId: z.string().uuid("Invalid ID"),
  memberIds: z
    .array(z.string().uuid("Invalid ID"))
    .min(3, "Need minimum 3 users to create a group."),
});

export const addMemberSchema = z.object({
  groupId: z.string().uuid("Invalid ID"),
  memberIds: z
    .array(z.string().uuid("Invalid ID"))
    .min(1, "Need minimum 1 user to add to a group."),
});

export const removeMemberSchema = z.object({
  groupId: z.string().uuid("Invalid ID"),
  memberId: z.string().uuid("Invalid ID"),
});

export const sendMsgInGroupSchema = z
  .object({
    senderId: z.string().uuid("Invalid ID"),
    text: z.string().optional(),
    media: z.string().optional(),
    groupId: z.string().uuid("Invalid ID"),
  })
  .refine((data) => data.text || data.media, {
    message: "Message must contain either text or media content",
    path: ["text", "media"], // Shows both fields in error
  });
