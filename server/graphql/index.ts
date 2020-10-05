import { AuthChecker, buildSchemaSync } from 'type-graphql';
import { UserVerifyResult } from '../models/user';
import UserResolvers from './resolvers/user';
import CharacterResolvers from './resolvers/character';

const customAuthChecker: AuthChecker<{ currentUser: UserVerifyResult }> = (
    { context },
    roles,
) => {
    const user = context.currentUser.user;

    if (!user) {
        return false;
    } else if (user.authority.includes('admin')) {
        return true;
    } else {
        const difference = user.authority.filter((auth) =>
            roles.includes(auth),
        );
        return difference.length === roles.length;
    }
};

export const schema = buildSchemaSync({
    resolvers: [UserResolvers, CharacterResolvers],
    dateScalarMode: 'timestamp',
    authChecker: customAuthChecker,
});
