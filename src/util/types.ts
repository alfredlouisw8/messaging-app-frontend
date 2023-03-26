import { ConversationPopulated } from "../../../backend/src/util/types";

/**
 * User
 */

export interface CreateUsernameData {
	createUsername: {
		success: boolean;
		error: string;
	};
}

export interface CreateUsernameVariables {
	username: string;
}

export interface SearchUsersInput {
	username: string;
}

export interface SearchUsersData {
	searchUsers: SearchedUser[];
}

export interface SearchedUser {
	id: string;
	username: string;
}

/**
 * Conversation
 */
export interface ConversationsData {
	conversations: ConversationPopulated[];
}

export interface CreateConversationData {
	createConversation: {
		conversationId: string;
	};
}

export interface CreateConversationInput {
	participantIds: string[];
}
