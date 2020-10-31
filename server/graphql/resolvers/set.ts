/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resolver, Mutation, ID, Authorized, Arg } from 'type-graphql';
// import { Types } from 'mongoose';
import BasicDataModel from '../../models/basicData';
import { CharacterInterface } from '../models/character';
import { GroupInterface } from '../models/group';
import { BasicInputUnion } from '../models/unionType';

@Resolver()
export default class Set {
    @Authorized('set')
    @Mutation(() => Boolean)
    async add(
        @Arg('data', () => BasicInputUnion)
        data: CharacterInterface | GroupInterface,
    ): Promise<boolean> {
        try {
            const setData = new BasicDataModel({
                ...data,
            });
            await setData.save();
            return true;
        } catch (e) {
            throw new Error('generation failure');
        }
    }

    @Authorized('set')
    @Mutation(() => Boolean)
    async remove(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await BasicDataModel.findByIdAndRemove(id).exec();
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }

    //     @Authorized('set')
    //     @Mutation(() => Boolean)
    //     async set(
    //         @Arg('id', () => ID, { nullable: false }) id: string,
    //         @Arg('data', () => BasicInputUnion)
    //         data: CharacterInterface | GroupInterface,
    //     ): Promise<boolean> {
    //         try {
    //             const update = {
    //                 $set: {
    //                     ...data,
    //                     groupId: data.groupId
    //                         ? ((Types.ObjectId(data.groupId) as unknown) as string)
    //                         : undefined,
    //                     group: undefined,
    //                 },
    //             };
    //             const char = await BasicDataModel.findByIdAndUpdate(id, update, {
    //                 new: true,
    //             }).exec();

    //             if (!char) {
    //                 throw new Error('update failure');
    //             }

    //             return true;
    //         } catch (e) {
    //             throw new Error('update failure');
    //         }
    //     }
}
