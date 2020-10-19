import {
    Resolver,
    Query,
    Ctx,
    Field,
    ObjectType,
    ID,
    Int,
    Authorized,
    Arg,
} from 'type-graphql';
import UserModels, { UserVerifyResult } from '../../models/user';
import authChecker from '../../lib/authChecker';

@ObjectType({ description: '유저 정보' })
export class User {
    @Field(() => ID, {
        name: 'id',
        description: '유저 ID (<sns type>::<sns id>)',
        nullable: false,
    })
    _id?: string;
    @Field(() => Int, {
        description: '가입 순서',
        nullable: false,
    })
    uid?: number;
    @Field({
        description: '닉네임',
        nullable: true,
    })
    nickname?: string;
    @Field({
        description: '프로필 url',
        nullable: true,
    })
    profileImage?: string;
    @Field({
        description: '가입 날짜',
        nullable: false,
    })
    createdAt?: Date;
    @Field(() => [String], {
        description: '권한',
        nullable: false,
    })
    authority?: string[];
}

@Resolver()
export default class UserResolver {
    @Query(() => User, { nullable: true })
    me(@Ctx() ctx: { currentUser: UserVerifyResult }): User | null {
        const { user, error } = ctx.currentUser;
        if (error) {
            return null;
        }
        return user as User;
    }

    @Authorized('user')
    @Query(() => [User])
    async allUser(): Promise<User[]> {
        const users = await UserModels.find();
        return users as User[];
    }

    @Query(() => Boolean)
    authChecker(
        @Ctx() ctx: { currentUser: UserVerifyResult },
        @Arg('roles', () => [String], { nullable: false }) roles: Array<string>,
    ): boolean {
        if (ctx.currentUser.user) {
            return authChecker(ctx.currentUser.user, roles);
        }
        return false;
    }
}
