import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { withApollo } from 'next-with-apollo';

const prod = process.env.NODE_ENV === 'production';

export default withApollo(({ initialState }) => {
    return new ApolloClient({
        cache: new InMemoryCache().restore(initialState || {}),
        link: createUploadLink({
            uri: prod ? '' : 'http://localhost:4000/graphql',
        }),
    });
});
