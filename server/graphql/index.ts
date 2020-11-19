import { AuthChecker, buildSchemaSync } from 'type-graphql';

import GetResolver from './resolvers/get';
import ImageUploadResolver from './resolvers/imageUpload';
import LikeResolver from './resolvers/like';
import RecommendResolvers from './resolvers/recommend';
import SetResolvers from './resolvers/set';
import UserResolvers from './resolvers/user';
import { UserVerifyResult } from '../models/user';
import authChecker from '../lib/authChecker';

const customAuthChecker: AuthChecker<{ currentUser: UserVerifyResult }> = (
    { context },
    roles,
) => {
    const user = context.currentUser.user;
    if (user) return authChecker(user, roles);
    return false;
};

export const schema = buildSchemaSync({
    resolvers: [
        UserResolvers,
        SetResolvers,
        GetResolver,
        ImageUploadResolver,
        LikeResolver,
        RecommendResolvers,
    ],
    dateScalarMode: 'timestamp',
    authChecker: customAuthChecker,
});
