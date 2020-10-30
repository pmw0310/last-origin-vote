/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputType, Field, ObjectType } from 'type-graphql';
import BasicDataModel, { BasicDataType } from '../../models/basicData';
import { Character } from './character';
import { BasicDataInterface, BasicData } from '../models/basicData';

@ObjectType({ implements: BasicDataInterface })
@InputType('GroupInput')
export class GroupInterface extends BasicDataInterface {}

@ObjectType({ implements: BasicData })
export class Group extends BasicData {
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
            groupId: id,
            basicType: BasicDataType.CHARACTER,
        }).exec();
        return char as Character[];
    }
}
