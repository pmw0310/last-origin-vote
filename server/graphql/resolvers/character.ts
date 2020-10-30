/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resolver, Mutation, ID, Authorized, Arg } from 'type-graphql';
import { Types } from 'mongoose';
import BasicDataModel from '../../models/basicData';
import { CharacterInterface } from '../models/character';

@Resolver()
export default class CharacterResolver {
    @Authorized('character')
    @Mutation(() => Boolean)
    async addCharacter(
        @Arg('data') data: CharacterInterface,
    ): Promise<boolean> {
        try {
            const char = new BasicDataModel({
                ...data,
                groupId: data.groupId
                    ? Types.ObjectId(data.groupId)
                    : undefined,
                group: undefined,
            });
            await char.save();
            return true;
        } catch (e) {
            throw new Error('generation failure');
        }
    }

    @Authorized('character')
    @Mutation(() => Boolean)
    async removeCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await BasicDataModel.findByIdAndRemove(id).exec();
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }

    @Authorized('character')
    @Mutation(() => Boolean)
    async updateCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false }) data: CharacterInterface,
    ): Promise<boolean> {
        try {
            const update = {
                $set: {
                    ...data,
                    groupId: data.groupId
                        ? ((Types.ObjectId(data.groupId) as unknown) as string)
                        : undefined,
                    group: undefined,
                },
            };
            const char = await BasicDataModel.findByIdAndUpdate(id, update, {
                new: true,
            }).exec();

            if (!char) {
                throw new Error('update failure');
            }

            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }
}
