/* eslint-disable @typescript-eslint/no-explicit-any */
import { Arg, Authorized, ID, Mutation, Resolver } from 'type-graphql';
import { statSync, unlinkSync } from 'fs';

import { ApolloError } from 'apollo-server-koa';
import BasicDataModel from '../../models/basicData';
import { InputData } from '../models/inputData';
import { Types } from 'mongoose';
import path from 'path';

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
                skinCharId: data.skinCharId
                    ? Types.ObjectId(data.skinCharId)
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
            const profileImage = await BasicDataModel.findById(id)
                .select('profileImage')
                .lean()
                .exec();

            if (
                profileImage &&
                profileImage.profileImage &&
                profileImage.profileImage !== data.profileImage
            ) {
                const dir = path.normalize(
                    `${__dirname}/../../../assets/${profileImage.profileImage}`,
                );
                const webpDir = dir
                    .replace(/.png$/, '.webp')
                    .replace(/.jpg$/, '.webp');

                statSync(dir) && unlinkSync(dir);
                statSync(webpDir) && unlinkSync(webpDir);
            }

            const update = {
                $set: {
                    ...data,
                    charGroupId: data.charGroupId
                        ? (Types.ObjectId(data.charGroupId) as any)
                        : undefined,
                    skinCharId: data.skinCharId
                        ? Types.ObjectId(data.skinCharId)
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
