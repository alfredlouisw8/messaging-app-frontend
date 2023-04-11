import { Box, Button } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import {
	gql,
	OperationVariables,
	useMutation,
	useQuery,
	useSubscription,
} from "@apollo/client";
import {
	ConversationDeletedData,
	ConversationPopulated,
	ConversationsData,
	ConversationUpdatedData,
	ParticipantPopulated,
} from "@/util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "@/components/common/SkeletonLoader";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";

interface IConversationWrapperProps {
	session: Session;
}

const ConversationWrapper: React.FC<IConversationWrapperProps> = ({
	session,
}) => {
	const router = useRouter();

	const {
		query: { conversationId },
	} = router;

	const {
		user: { id: userId },
	} = session;

	const {
		data: conversationData,
		error: conversationError,
		loading: conversationLoading,
		subscribeToMore,
	} = useQuery<ConversationsData, OperationVariables>(
		ConversationOperations.Queries.conversations
	);

	const [markConversationAsRead, { data, error, loading }] = useMutation<
		{ markConversationAsRead: boolean },
		{ userId: string; conversationId: string }
	>(ConversationOperations.Mutations.markConversationAsRead);

	useSubscription<ConversationUpdatedData, OperationVariables>(
		ConversationOperations.Subscriptions.conversationUpdated,
		{
			onData: ({ client, data }) => {
				const { data: subscriptionData } = data;

				if (!subscriptionData) return;

				const {
					conversationUpdated: { conversation: updatedConversation },
				} = subscriptionData;

				const currentlyViewingConversation =
					updatedConversation.id === conversationId;

				if (currentlyViewingConversation) {
					onViewConversation(conversationId as string, false);
				}
			},
		}
	);

	useSubscription<ConversationDeletedData, OperationVariables>(
		ConversationOperations.Subscriptions.conversationDeleted,
		{
			onData: ({ client, data }) => {
				const { data: subscriptionData } = data;

				if (!subscriptionData) return;

				const existing = client.readQuery<ConversationsData>({
					query: ConversationOperations.Queries.conversations,
				});

				if (!existing) return;

				const { conversations } = existing;
				const {
					conversationDeleted: { id: deletedConversationId },
				} = subscriptionData;

				client.writeQuery<ConversationsData>({
					query: ConversationOperations.Queries.conversations,
					data: {
						conversations: conversations.filter(
							(conversation) => conversation.id !== deletedConversationId
						),
					},
				});

				router.push("/");
			},
		}
	);

	const onViewConversation = async (
		conversationId: string,
		hasSeenLatestMessage: boolean | undefined
	) => {
		/**
		 * 1. Push the conversationId to the router query param
		 */

		router.push({ query: { conversationId } });
		/**
		 * 2. Mark the conversation as read
		 */

		if (hasSeenLatestMessage) return;

		try {
			await markConversationAsRead({
				variables: {
					conversationId,
					userId,
				},
				optimisticResponse: {
					markConversationAsRead: true,
				},
				update: (cache) => {
					/**
					 * Get conversation participant from cache
					 */

					const participantsFragment = cache.readFragment<{
						participants: ParticipantPopulated[];
					}>({
						id: `Conversation:${conversationId}`,
						fragment: gql`
							fragment Participants on Conversation {
								participants {
									user {
										id
										username
									}
									hasSeenLatestMessage
								}
							}
						`,
					});

					if (!participantsFragment) return;

					const participants = [...participantsFragment.participants];

					const userParticipantIds = participants.findIndex(
						(p) => p.user.id === userId
					);

					if (userParticipantIds === -1) return;

					const userParticipant = participants[userParticipantIds];

					/**
					 * Update participant to show latest message as read
					 */

					participants[userParticipantIds] = {
						...userParticipant,
						hasSeenLatestMessage: true,
					};

					/**
					 * Update cache
					 */

					cache.writeFragment({
						id: `Conversation:${conversationId}`,
						fragment: gql`
							fragment Participants on Conversation {
								participants
							}
						`,
						data: {
							participants,
						},
					});
				},
			});
		} catch (error: any) {
			console.log("onViewConversation error", error);
			toast.error(error?.message);
		}
	};

	const subscribeToMoreConversations = () => {
		subscribeToMore({
			document: ConversationOperations.Subscriptions.conversationCreated,
			updateQuery: (
				prev,
				{
					subscriptionData,
				}: {
					subscriptionData: {
						data: { conversationCreated: ConversationPopulated };
					};
				}
			) => {
				if (!subscriptionData.data) return prev;

				const newConversation = subscriptionData.data.conversationCreated;

				return Object.assign({}, prev, {
					conversations: [newConversation, ...prev.conversations],
				});
			},
		});
	};

	/**
	 * Executes subscription on mount
	 */
	useEffect(() => {
		subscribeToMoreConversations();
	}, []);

	return (
		<Box
			width={{ base: "100%", md: "400px" }}
			display={{ base: conversationId ? "none" : "flex", md: "flex" }}
			bg="whiteAlpha.50"
			flexDirection="column"
			gap={4}
			py={6}
			px={3}
		>
			{conversationLoading ? (
				<SkeletonLoader count={7} height="80px" width="100%" />
			) : (
				<ConversationList
					session={session}
					conversations={conversationData?.conversations || []}
					onViewConversation={onViewConversation}
				/>
			)}
		</Box>
	);
};

export default ConversationWrapper;
