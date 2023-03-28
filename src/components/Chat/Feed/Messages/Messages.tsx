import SkeletonLoader from "@/components/common/SkeletonLoader";
import { MessagesData, MessagesVariables } from "@/util/types";
import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import { toast } from "react-hot-toast";
import MessagesOperations from "../../../../graphql/operations/message";

interface IMessagesProps {
	userId: string;
	conversationId: string;
}

const Messages: React.FC<IMessagesProps> = ({ userId, conversationId }) => {
	const { data, loading, error, subscribeToMore } = useQuery<
		MessagesData,
		MessagesVariables
	>(MessagesOperations.Queries.messages, {
		variables: { conversationId },
		onError: ({ message }) => {
			toast.error(message);
		},
	});

	if (error) {
		return null;
	}

	return (
		<Flex direction="column" justify="flex-end" overflow="hidden">
			{loading && (
				<Stack spacing={4} px={4}>
					<SkeletonLoader count={4} height="60px" width="100%" />
				</Stack>
			)}
			{data?.messages && (
				<Flex direction="column-reverse" overflow="auto" height="100%">
					{data.messages.map((message) => (
						// <MessageItem />

						<div key={message.id}>{message.body}</div>
					))}
				</Flex>
			)}
		</Flex>
	);
};

export default Messages;
