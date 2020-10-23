import { useMemo } from 'react';
import {
    ApolloClient,
    InMemoryCache,
    makeVar,
    gql,
    NormalizedCacheObject,
} from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { UserInterface } from 'Module';
import { relayStylePagination } from '@apollo/client/utilities';

export interface CurrentUserData {
    currentUser: UserInterface;
}

export const currentUserVar = makeVar<UserInterface | null>(null);

export const GET_CURRENT_USER = gql`
    query {
        currentUser @client
    }
`;

const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                currentUser() {
                    return currentUserVar();
                },
                get: relayStylePagination(['lastId']),
            },
        },
    },
});

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: createUploadLink({
            uri: '/graphql',
        }),
        cache,
    });
}

export function initializeApollo(
    initialState?: NormalizedCacheObject,
): ApolloClient<NormalizedCacheObject> {
    const _apolloClient = createApolloClient();

    if (initialState) {
        _apolloClient.cache.restore(initialState);
    }

    return _apolloClient;
}

export function useApollo(
    initialState?: NormalizedCacheObject,
): ApolloClient<NormalizedCacheObject> {
    const store = useMemo(() => initializeApollo(initialState), [initialState]);
    return store;
}
