/** Types consumed by the dashboard app (stable public API). */

export type RoomRole = "room_creator" | "room_member";

export type MatchPhase =
	| "LOBBY"
	| "SWIPING"
	| "WAITING_ROUND"
	| "FINAL_PICK";

export type RoomStatus = "PENDING" | "SET" | "EXCEPTION";

export type MatchUserStatus = "ACTIVE" | "WAITING" | "CLOSED";

export type RoomMember = {
	userId: string;
	name: string;
};

export type RoomParticipant = {
	userId: string;
	name: string;
	role: string;
	userStatus: MatchUserStatus;
	likedCount?: number;
};

export type RoomDeckSummary = {
	hasDeck: boolean;
	docCount?: number;
	firstMovieId?: number;
	lastMovieId?: number;
};

export type ChatMessage = {
	userId: string;
	userName: string;
	message: string;
	createdAt: number;
};

export type Room = {
	roomId: string;
	publicCode: string;
	createdBy: string | null;
	users: string[];
	userRoles: Record<string, RoomRole>;
	choices: Record<string, string>;
	isMember: boolean;
	isCreator: boolean;
	canManage: boolean;
	currentUserRole?: RoomRole;
	createdAt: number;
	updatedAt: number;
	isMuted?: boolean;
	matchPhase?: MatchPhase;
	roomStatus?: RoomStatus;
	aggregateVersion?: number;
	participants?: RoomParticipant[];
	deck?: RoomDeckSummary;
	hasFilters?: boolean;
};
