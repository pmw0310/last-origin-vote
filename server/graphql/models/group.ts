/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field, ObjectType } from 'type-graphql';
import BasicDataModel, { BasicDataType } from '../../models/basicData';
import { Character } from './character';
import { BasicData } from '../models/basicData';

export class GroupInput {}

@ObjectType({ implements: BasicData })
export class Group extends BasicData implements GroupInput {
    @Field(() => [Character], {
        description: '소속된 케릭터 정보',
        nullable: true,
    })
    async character?(): Promise<Character[]> {
        let id = this._id;
        if (!id) {
            id = (this as any)._doc._id;
        }
        const char = await BasicDataModel.find({
            charGroupId: id,
            type: BasicDataType.CHARACTER,
        }).exec();
        return char as Character[];
    }
}
