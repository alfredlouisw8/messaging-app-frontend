import {
	CreateConversationData,
	CreateConversationInput,
	SearchedUser,
	SearchUsersData,
	SearchUsersInput,
} from "@/util/types";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Stack,
} from "@chakra-ui/react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import UserOperations from "../../../../graphql/operations/user";
import ConversationOperations from "../../../../graphql/operations/conversation";
import Participants from "./Participants";
import UserSearchList from "./UserSearchList";
import { Session } from "next-auth";
import { useRouter } from "next/router";

interface IModalProps {
	isOpen: boolean;
	onClose: () => void;
	session: Session;
}

const ConversationModal: React.FC<IModalProps> = ({
	session,
	isOpen,
	onClose,
}) => {
	const {
		user: { id: userId },
	} = session;

	const router = useRouter();

	const [username, setUsername] = useState("");
	const [participants, setParticipants] = useState<SearchedUser[]>([]);

	const [searchUsers, { data, error, loading }] = useLazyQuery<
		SearchUsersData,
		SearchUsersInput
	>(UserOperations.Queries.searchUsers);

	const [createConversation, { loading: createConversationLoading }] =
		useMutation<CreateConversationData, CreateConversationInput>(
			ConversationOperations.Mutations.createConversation
		);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		searchUsers({ variables: { username } });
	};

	const addParticipant = (user: SearchedUser) => {
		setParticipants((prevState) => [...prevState, user]);
		setUsername("");
	};

	const removeParticipant = (userId: string) => {
		setParticipants((prevState) =>
			prevState.filter((user) => user.id !== userId)
		);
	};

	const onCreateConversation = async () => {
		const participantIds = [
			userId,
			...participants.map((participant) => participant.id),
		];
		try {
			const { data } = await createConversation({
				variables: {
					participantIds,
				},
			});

			if (!data?.createConversation) {
				throw new Error("Failed to create conversation");
			}

			const {
				createConversation: { conversationId },
			} = data;

			router.push({ query: { conversationId } });

			/**
			 * Clear state and close modal
			 * on successful creation
			 */

			setParticipants([]);
			setUsername("");
			onClose();
		} catch (error: any) {
			console.error("onCreateConversation error", error);
			toast.error(error?.message);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent bg="#2d2d2d" pb={4}>
				<ModalHeader>Create a Conversation</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<form onSubmit={onSubmit}>
						<Stack spacing={4}>
							<Input
								placeholder="Enter a username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
							<Button type="submit" isDisabled={!username} isLoading={loading}>
								Search
							</Button>
						</Stack>
					</form>
					{data?.searchUsers && (
						<UserSearchList
							addParticipant={addParticipant}
							users={data.searchUsers}
						/>
					)}
					{participants.length > 0 && (
						<>
							<Participants
								participants={participants}
								removeParticipant={removeParticipant}
							/>
							<Button
								bg="brand.100"
								width="100%"
								mt={6}
								_hover={{ bg: "brand.100" }}
								isLoading={createConversationLoading}
								onClick={onCreateConversation}
							>
								Create Conversation
							</Button>
						</>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default ConversationModal;
