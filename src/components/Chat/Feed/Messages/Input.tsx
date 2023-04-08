import { MessagesData, MessagesVariables } from "@/util/types";
import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { ObjectId } from "bson";
import { Session } from "next-auth";
import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { SendMessageArguments } from "../../../../../../backend/src/util/types";
import MessageOperations from "../../../../graphql/operations/message";

interface IMessageInputProps {
	session: Session;
	conversationId: string;
}

const MessageInput: React.FC<IMessageInputProps> = ({
	session,
	conversationId,
}) => {
	const [messageBody, setMessageBody] = useState("");

	const [sendMessage] = useMutation<
		{ sendMessage: boolean },
		SendMessageArguments
	>(MessageOperations.Mutations.sendMessage);

	const onSendMessage = async (event: FormEvent) => {
		event.preventDefault();

		try {
			// call sendMessage mutation

			const {
				user: { id: senderId },
			} = session;

			const newMessage: SendMessageArguments = {
				senderId,
				conversationId,
				body: messageBody,
			};

			setMessageBody("");

			const { data, errors } = await sendMessage({
				variables: {
					...newMessage,
				},
				optimisticResponse: {
					sendMessage: true,
				},
				update: (cache) => {
					const existing = cache.readQuery<MessagesData>({
						query: MessageOperations.Queries.messages,
						variables: { conversationId },
					});

					const existingMessages = existing ? existing.messages : [];

					cache.writeQuery<MessagesData, MessagesVariables>({
						query: MessageOperations.Queries.messages,
						variables: { conversationId },
						data: {
							...existing,
							messages: [
								{
									id: new ObjectId().toString(),
									body: messageBody,
									senderId: session.user.id,
									conversationId,
									sender: {
										id: session.user.id,
										username: session.user.username,
									},
									createdAt: new Date(),
									updatedAt: new Date(),
								},
								...existingMessages,
							],
						},
					});
				},
			});

			if (!data?.sendMessage || errors) {
				throw new Error("Failed to send message");
			}
		} catch (error: any) {
			console.log("onSendMessage error", error);
			toast.error(error?.message);
		}
	};

	return (
		<Box px={4} py={6} width="100%">
			<form onSubmit={onSendMessage}>
				<Input
					value={messageBody}
					size="md"
					placeholder="New Message"
					onChange={(e) => setMessageBody(e.target.value)}
					resize="none"
					_focus={{
						boxShadow: "none",
						border: "1px solid",
						borderColor: "whiteAlpha.300",
					}}
				/>
			</form>
		</Box>
	);
};

export default MessageInput;
