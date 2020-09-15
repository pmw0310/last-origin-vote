import { makeExecutableSchema } from 'apollo-server-koa';
import typeDefs from './type';
import resolvers from './resolvers';

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
