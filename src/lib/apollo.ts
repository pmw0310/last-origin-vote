import {
    ApolloClient,
    InMemoryCache,
    NormalizedCacheObject,
    gql,
    makeVar,
} from '@apollo/client';

import { GetStaticPropsResult } from 'next';
import { UserInterface } from 'Module';
import { createUploadLink } from 'apollo-upload-client';
import merge from 'deepmerge';
import { relayStylePagination } from '@apollo/client/utilities';
import { useMemo } from 'react';

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
                get: relayStylePagination(['endCursor']),
            },
        },
    },
});

export const APOLLO_STATE_PROP_NAME = 'initialApolloState';
export type getStaticPropsResult = GetStaticPropsResult<{
    [APOLLO_STATE_PROP_NAME]: NormalizedCacheObject;
}>;

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: createUploadLink({
            uri: `${process.env.SERVER_URI}/graphql`,
            credentials: 'include',
        }),
        cache,
    });
}

export function initializeApollo(
    initialState?: NormalizedCacheObject,
): ApolloClient<NormalizedCacheObject> {
    const _apolloClient = apolloClient ?? createApolloClient();

    // If your page has Next.js data fetching methods that use Apollo Client, the initial state
    // gets hydrated here
    if (initialState) {
        // Get existing cache, loaded during client side data fetching
        const existingCache = _apolloClient.extract();

        // Merge the existing cache into data passed from getStaticProps/getServerSideProps
        const data = merge(initialState, existingCache);

        // Restore the cache with the merged data
        _apolloClient.cache.restore(data);
    }
    // For SSG and SSR always create a new Apollo Client
    if (typeof window === 'undefined') return _apolloClient;
    // Create the Apollo Client once in the client
    if (!apolloClient) apolloClient = _apolloClient;

    return _apolloClient;
}

type pageProps = {
    props: {
        [key: string]: NormalizedCacheObject;
    };
};

export function addApolloState(
    client: ApolloClient<NormalizedCacheObject>,
    pageProps: pageProps,
): pageProps {
    if (pageProps?.props) {
        pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
    }

    return pageProps;
}

export function useApollo(pageProps: {
    [key: string]: NormalizedCacheObject;
}): ApolloClient<NormalizedCacheObject> {
    const state = pageProps[APOLLO_STATE_PROP_NAME];
    const store = useMemo(() => initializeApollo(state), [state]);
    return store;
}
