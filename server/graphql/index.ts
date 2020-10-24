import { AuthChecker, buildSchemaSync } from 'type-graphql';
import { UserVerifyResult } from '../models/user';
import UserResolvers from './resolvers/user';
import CharacterResolvers from './resolvers/character';
import ImageUploadResolver from './resolvers/imageUpload';
import GroupResolver from './resolvers/group';
import LikeResolver from './resolvers/like';
import GetResolver from './resolvers/get';
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
        CharacterResolvers,
        ImageUploadResolver,
        GroupResolver,
        GetResolver,
        LikeResolver,
    ],
    dateScalarMode: 'timestamp',
    authChecker: customAuthChecker,
});
