import {
  User,
  FriendReq,
  Task,
  Milestone,
  Message,
  Group,
  GroupMessage,
} from "@prisma/client";
export type { User, FriendReq, Task, Milestone, Message, Group, GroupMessage };

export interface Friend {
  id: string;
  email: string;
  username: string;
  profileImg: string | null;
  pubKey: string | null;
  createdAt: Date;
  friendshipId: string;
}

export interface UserData {
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

export interface ChatApiData {
  messages: Message[];
  friend: UserData;
  user: UserData;
  nextCursor: string | null;
}

export interface GroupMetadata {
  grpName: string;
  grpImg: string;
}

export interface GroupMember extends UserData {
  isAdmin: boolean;
  isCreator: boolean;
}

export interface GroupData {
  group: GroupMetadata;
  members: GroupMember[];
}

export interface GroupChats {
  messages: GroupMessage[];
  nextCursor: string | null;
}

export type page = {
  messages: GroupMessage[];
  nextCursor: string | null;
};

export interface GroupMsgsData {
  pageParams: string[] | undefined[];
  pages: page[];
}

export type frndpage = {
  messages: Message[];
  friend: UserData;
  user: UserData;
  nextCursor: string | null;
};

export interface ChatData {
  pageParams: string[] | undefined[];
  pages: frndpage[];
}
