import { split, ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getSession } from "next-auth/react";

const httpLink = new HttpLink({
	uri: `${process.env.NEXT_PUBLIC_SERVER_URL}/graphql`,
	credentials: "include",
});

const wsLink =
	typeof window !== "undefined"
		? new GraphQLWsLink(
				createClient({
					url: `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/graphql/subscriptions`,
					connectionParams: async () => ({
						session: await getSession(),
					}),
				})
		  )
		: null;

const link =
	typeof window !== "undefined" && wsLink !== null
		? split(
				({ query }) => {
					const definition = getMainDefinition(query);
					return (
						definition.kind === "OperationDefinition" &&
						definition.operation === "subscription"
					);
				},
				wsLink,
				httpLink
		  )
		: httpLink;

export const client = new ApolloClient({
	link,
	cache: new InMemoryCache(),
});
