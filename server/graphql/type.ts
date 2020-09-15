import { gql } from 'apollo-server-koa';

export default gql`
    type Query {
        """
        test docs
        """
        hello: String
    }
`;
