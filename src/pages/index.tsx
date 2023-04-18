import Auth from "@/components/Auth/Auth";
import Chat from "@/components/Chat/Chat";
import { Box } from "@chakra-ui/layout";
import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	const { data: session } = useSession();

	const reloadSession = () => {
		const event = new Event("visibilitychange");
		document.dispatchEvent(event);
	};
	return (
		<>
			<Head>
				<title>Messaging App</title>
				<meta name="description" content="Messaging App built with NextJS, TypeScript, Prisma, GraphQL, MongoDB, Apollo, NodeJS" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Box>
				{session?.user?.username ? (
					<Chat session={session} />
				) : (
					<Auth session={session} reloadSession={reloadSession} />
				)}
			</Box>
		</>
	);
}

export async function getServerSideProps(context: NextPageContext) {
	const session = await getSession(context);

	return {
		props: {
			session,
		},
	};
}
