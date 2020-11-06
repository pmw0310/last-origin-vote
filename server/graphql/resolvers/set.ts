/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resolver, Mutation, ID, Authorized, Arg } from 'type-graphql';
import { ApolloError } from 'apollo-server-koa';
import { Types } from 'mongoose';
import BasicDataModel from '../../models/basicData';
import { InputData } from '../models/inputData';
import {
    CharacterGrade,
    CharacterType,
    CharacterRole,
} from '../../models/basicData';

@Resolver()
export default class CharacterResolver {
    @Authorized('set')
    @Mutation(() => Boolean)
    async add(@Arg('data') data: InputData): Promise<boolean> {
        try {
            const doc = new BasicDataModel({
                ...data,
                charGroupId: data.charGroupId
                    ? Types.ObjectId(data.charGroupId)
                    : undefined,
                charGrade: data.charGrade
                    ? CharacterGrade[data.charGrade]
                    : undefined,
                charLastGrade: data.charLastGrade
                    ? CharacterGrade[data.charLastGrade]
                    : undefined,
                charType: data.charType
                    ? CharacterType[data.charType]
                    : undefined,
                charRole: data.charRole
                    ? CharacterRole[data.charRole]
                    : undefined,
            });
            await doc.save();
            return true;
        } catch (e) {
            console.error(e);
            throw new ApolloError('add failure', '400');
        }
    }

    @Authorized('set')
    @Mutation(() => Boolean)
    async remove(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await BasicDataModel.findByIdAndDelete({
                _id: id,
            }).exec();
            return true;
        } catch (e) {
            console.error(e);
            throw new ApolloError('update failure', '400');
        }
    }

    @Authorized('set')
    @Mutation(() => Boolean)
    async update(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false }) data: InputData,
    ): Promise<boolean> {
        try {
            const update = {
                $set: {
                    ...data,
                    charGroupId: data.charGroupId
                        ? (Types.ObjectId(data.charGroupId) as any)
                        : undefined,
                    updateAt: new Date(),
                },
            };
            const doc = await BasicDataModel.findOneAndUpdate(
                { _id: id, type: data.type },
                update,
            ).exec();

            if (!doc) {
                throw new ApolloError('update failure', '400');
            }

            return true;
        } catch (e) {
            console.error(e);
            throw new ApolloError('update failure', '400');
        }
    }
}
