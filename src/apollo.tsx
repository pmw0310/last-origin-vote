import { ApolloClient, InMemoryCache, makeVar, gql } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { withApollo } from 'next-with-apollo';

const prod = process.env.NODE_ENV === 'production';

export interface User {
    id: string;
    uid: string;
    nickname?: string;
    profileImage?: string;
    createdAt: number;
    authority: string[];
}

export interface CurrentUserData {
    currentUser: User;
}

export const currentUserVar = makeVar<User | null>(null);

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
            },
        },
    },
});

export default withApollo(({ initialState }) => {
    return new ApolloClient({
        cache: cache.restore(initialState || {}),
        link: createUploadLink({
            uri: prod ? '' : 'http://localhost:4000/graphql',
        }),
    });
});
