/** Ответы legacy API могут быть с обёрткой или без — как в apisauce у RN. */
export type LegacyApiEnvelope<T> = {
  ok?: boolean;
  success?: boolean;
  data?: T;
  message?: string;
};

export type LegacyRoom = {
  id: string;
  authorId?: string;
  key: string;
  createdAt?: string | Date;
  users?: LegacyUser[];
  matches?: unknown[];
  status?: string;
  filters?: string;
};

export type LegacyUser = {
  id: number;
  username?: string;
  email?: string;
};

export type UserRoomMembership = {
  roomKey: string;
  roomId: string;
  role: string;
  isAuthor: boolean;
  userStatus: string;
  matchPhase: string;
  roomStatus: string;
  roomName: string | null;
};
