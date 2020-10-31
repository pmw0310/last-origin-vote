/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resolver, Mutation, ID, Authorized, Arg } from 'type-graphql';
import { Types } from 'mongoose';
import BasicDataModel, { BasicDataType } from '../../models/basicData';
import { CharacterInterface } from '../models/character';
import { ApolloError } from 'apollo-server-koa';

@Resolver()
export default class CharacterResolver {
    @Authorized('character')
    @Mutation(() => Boolean)
    async addCharacter(
        @Arg('data') data: CharacterInterface,
    ): Promise<boolean> {
        if (data.basicType !== BasicDataType.CHARACTER) {
            throw new ApolloError('BasicDataType is incorrect', '400');
        }
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
            throw new ApolloError('generation failure', '400');
        }
    }

    @Authorized('character')
    @Mutation(() => Boolean)
    async removeCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await BasicDataModel.findOneAndDelete({
                _id: id,
                basicType: BasicDataType.CHARACTER,
            }).exec();
            return true;
        } catch (e) {
            throw new ApolloError('update failure', '400');
        }
    }

    @Authorized('character')
    @Mutation(() => Boolean)
    async updateCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false }) data: CharacterInterface,
    ): Promise<boolean> {
        if (data.basicType !== BasicDataType.CHARACTER) {
            throw new ApolloError('BasicDataType is incorrect', '400');
        }
        try {
            const update = {
                $set: {
                    ...data,
                    groupId: data.groupId
                        ? (Types.ObjectId(data.groupId) as any)
                        : undefined,
                    group: undefined,
                },
            };
            const char = await BasicDataModel.findOneAndUpdate(
                { _id: id, basicType: BasicDataType.CHARACTER },
                update,
            ).exec();

            if (!char) {
                throw new ApolloError('update failure', '400');
            }

            return true;
        } catch (e) {
            throw new ApolloError('update failure', '400');
        }
    }
}
