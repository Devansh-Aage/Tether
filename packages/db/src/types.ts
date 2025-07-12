import { User, FriendReq } from "@prisma/client";
export type { User, FriendReq };

export interface Friend {
  id: string;
  email: string;
  username: string;
  profileImg: string | null;
  pubKey: string | null;
  createdAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  sentAt: Date;
  senderImg: string;
  senderEmail: string;
  senderUsername: string;
  senderPubkey: string;
}
