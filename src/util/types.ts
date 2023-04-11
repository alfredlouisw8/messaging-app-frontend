/**
 * User
 */

import { Conversation, ConversationParticipant, Message } from "@prisma/client";

export type UserPopulated = {
	id: string;
	username: string | null;
};
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

export type ConversationPopulated = Conversation & {
	participants: ParticipantPopulated[];
	latestMessage: Message | null;
};

export type ParticipantPopulated = ConversationParticipant & {
	user: UserPopulated;
};
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

export interface ConversationUpdatedData {
	conversationUpdated: {
		conversation: ConversationPopulated;
	};
}

export interface ConversationDeletedData {
	conversationDeleted: {
		id: string;
	};
}

/**
 * Message
 */
export type MessagePopulated = Message & {
	sender: UserPopulated;
};
export interface MessagesData {
	messages: MessagePopulated[];
}

export interface SendMessageArguments {
	// id: string;
	conversationId: string;
	senderId: string;
	body: string;
}

export interface MessagesVariables {
	conversationId: string;
}

export interface MessageSubscriptionData {
	subscriptionData: {
		data: {
			messageSent: MessagePopulated;
		};
	};
}
