/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resolver, Mutation, ID, Authorized, Arg } from 'type-graphql';
import BasicDataModel, { BasicDataType } from '../../models/basicData';
import { GroupInterface } from '../models/group';

@Resolver()
export default class GroupResolver {
    @Authorized('group')
    @Mutation(() => Boolean)
    async addGroup(@Arg('data') data: GroupInterface): Promise<boolean> {
        if (data.basicType !== BasicDataType.GROUP) {
            throw new Error('BasicDataType is incorrect');
        }
        try {
            const group = new BasicDataModel(data);
            await group.save();
            return true;
        } catch (e) {
            throw new Error('generation failure');
        }
    }

    @Authorized('group')
    @Mutation(() => Boolean)
    async removeGroup(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await BasicDataModel.findOneAndRemove({
                _id: id,
                basicType: BasicDataType.GROUP,
            }).exec();
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }

    @Authorized('group')
    @Mutation(() => Boolean)
    async updateGroup(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false })
        data: GroupInterface,
    ): Promise<boolean> {
        if (data.basicType !== BasicDataType.GROUP) {
            throw new Error('BasicDataType is incorrect');
        }
        try {
            const update = { $set: { ...data, updateAt: new Date() } };
            const group = await BasicDataModel.findOneAndUpdate(
                {
                    _id: id,
                    basicType: BasicDataType.GROUP,
                },
                update,
            ).exec();

            if (!group) {
                throw new Error('update failure');
            }
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }
}
