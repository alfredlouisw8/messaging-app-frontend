import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";

interface IMessageInputProps {
	session: Session;
	conversationId: string;
}

const MessageInput: React.FC<IMessageInputProps> = ({
	session,
	conversationId,
}) => {
	const [messageBody, setMessageBody] = useState("");

	const onSendMessage = async (event: FormEvent) => {
		event.preventDefault();

		try {
			// call sendMessage mutation
		} catch (error: any) {
			console.log("onSendMessage error", error);
			toast.error(error?.message);
		}
	};

	return (
		<Box px={4} py={6} width="100%">
			<form onSubmit={() => {}}>
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
