import { ApolloClient, InMemoryCache, makeVar, gql } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { withApollo } from 'next-with-apollo';
import { UserInterface } from 'Module';

const prod = process.env.NODE_ENV === 'production';

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
