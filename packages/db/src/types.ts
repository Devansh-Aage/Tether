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
    sentAt: Date;
    id: string;
    email: string;
    username: string;
    profileImg: string | null;
    pubKey: string | null;
}