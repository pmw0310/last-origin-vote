import { UserTypeModel } from '../models/user';

export default (user: UserTypeModel, roles: Array<string>): boolean => {
    if (!user) {
        return false;
    } else if (user.authority.includes('admin')) {
        return true;
    }

    const difference = user.authority.filter((auth) => roles.includes(auth));
    return difference.length === roles.length;
};
