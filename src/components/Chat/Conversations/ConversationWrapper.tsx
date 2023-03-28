import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { OperationVariables, useQuery } from "@apollo/client";
import { ConversationsData } from "@/util/types";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "@/components/common/SkeletonLoader";

interface IConversationWrapperProps {
	session: Session;
}

const ConversationWrapper: React.FC<IConversationWrapperProps> = ({
	session,
}) => {
	const {
		data: conversationData,
		error: conversationError,
		loading: conversationLoading,
		subscribeToMore,
	} = useQuery<ConversationsData, OperationVariables>(
		ConversationOperations.Queries.conversations
	);

	const router = useRouter();

	const {
		query: { conversationId },
	} = router;

	const onViewConversation = async (conversationId: string) => {
		/**
		 * 1. Push the conversationId to the router query param
		 */

		router.push({ query: { conversationId } });
		/**
		 * 2. Mark the conversation as read
		 */
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

	console.log(conversationData);

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
