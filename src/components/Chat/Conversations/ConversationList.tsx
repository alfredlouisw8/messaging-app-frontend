import { useMutation } from "@apollo/client";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import ConversationItem from "./ConversationItem";
import ConversationModal from "./ConversationModal/Modal";
import ConversationOperations from "../../../graphql/operations/conversation";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";

interface IConversationListProps {
	session: Session;
	conversations: ConversationPopulated[];
	onViewConversation: (
		conversationId: string,
		hasSeenLatestMessage: boolean | undefined
	) => void;
}

const ConversationList: React.FC<IConversationListProps> = ({
	session,
	conversations,
	onViewConversation,
}) => {
	const router = useRouter();
	const {
		user: { id: userId },
	} = session;
	const [isOpen, setIsOpen] = useState(false);
	const [deleteConversation] = useMutation<{
		deleteConversation: boolean;
		conversationId: string;
	}>(ConversationOperations.Mutations.deleteConversation);

	const onOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);

	const onDeleteConversation = async (conversationId: string) => {
		try {
			toast.promise(
				deleteConversation({
					variables: {
						conversationId,
					},
					update: () => {
						router.replace(
							typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
								? process.env.NEXT_PUBLIC_BASE_URL
								: ""
						);
					},
				}),
				{
					loading: "Deleting conversation",
					success: "Conversation deleted",
					error: "Failed to delete conversation",
				}
			);
		} catch (error) {
			console.log("onDeleteConversation error", error);
		}
	};

	const sortedConversations = [
		...conversations.sort(
			(a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
		),
	];

	return (
		<Stack height="100%">
			<Box
				py={2}
				px={4}
				bg="blackAlpha.200"
				borderRadius={4}
				cursor="pointer"
				onClick={onOpen}
			>
				<Text textAlign="center" color="whiteAlpha.800" fontWeight={500}>
					Find or start a conversation
				</Text>
			</Box>
			<Stack flexGrow={1} overflow="auto">
				{sortedConversations.map((conversation) => {
					const participant = conversation.participants.find(
						(p) => p.user.id === userId
					);

					return (
						<ConversationItem
							conversation={conversation}
							key={conversation.id}
							onClick={() =>
								onViewConversation(
									conversation.id,
									participant?.hasSeenLatestMessage
								)
							}
							hasSeenLatestMessage={participant?.hasSeenLatestMessage}
							isSelected={conversation.id === router.query.conversationId}
							userId={userId}
							onDeleteConversation={onDeleteConversation}
						/>
					);
				})}
			</Stack>
			<Box bottom={0} left={0} width="100%">
				<Button width="100%" onClick={() => signOut()}>
					Logout
				</Button>
			</Box>
			<ConversationModal isOpen={isOpen} onClose={onClose} session={session} />
		</Stack>
	);
};

export default ConversationList;
