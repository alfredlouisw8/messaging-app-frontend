import { CreateUsernameData, CreateUsernameVariables } from "@/util/types";
import { useMutation } from "@apollo/client";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Center, Stack, Text } from "@chakra-ui/layout";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import UserOperations from "../../graphql/operations/user";

interface IAuthProps {
	session: Session | null;
	reloadSession: () => void;
}

const Auth: React.FunctionComponent<IAuthProps> = ({
	session,
	reloadSession,
}) => {
	const usernameRef = useRef<HTMLInputElement>(null);

	const [createUsername, { loading, error }] = useMutation<
		CreateUsernameData,
		CreateUsernameVariables
	>(UserOperations.Mutations.createUsername);

	const onSubmit = async () => {
		if (!usernameRef.current?.value) return;

		try {
			const { data } = await createUsername({
				variables: { username: usernameRef.current?.value },
			});

			if (!data?.createUsername) {
				throw new Error("Something went wrong");
			}

			if (data.createUsername.error) {
				const {
					createUsername: { error },
				} = data;

				throw new Error(error);
			}

			toast.success("Username successfuly created!");

			/**
			 * Reload session to obtain new username
			 */

			reloadSession();
		} catch (error: any) {
			toast.error(error?.message);
			console.log("onSubmit error", error);
		}
	};

	return (
		<Center height="100vh">
			<Stack align="center" spacing="8">
				{session ? (
					<>
						<Text fontSize="3xl">Create a username</Text>
						<Input placeholder="Enter a username" ref={usernameRef} />
						<Button width="100%" onClick={onSubmit} isLoading={loading}>
							Save
						</Button>
					</>
				) : (
					<>
						<Text fontSize="3xl">Messenger</Text>
						<Button
							onClick={() => signIn("google")}
							leftIcon={
								<Image
									height={20}
									width={20}
									alt="Google Icon"
									src="/images/googlelogo.png"
								/>
							}
						>
							Continue with Google
						</Button>
					</>
				)}
			</Stack>
		</Center>
	);
};

export default Auth;
