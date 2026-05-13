/** Types consumed by the dashboard app (stable public API). */

export type RoomRole = "room_creator" | "room_member";

export type RoomMember = {
	userId: string;
	name: string;
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
};
