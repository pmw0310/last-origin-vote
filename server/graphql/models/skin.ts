/* eslint-disable @typescript-eslint/no-explicit-any */

import BasicDataModel, { BasicDataType } from '../../models/basicData';
import { Field, ID, ObjectType } from 'type-graphql';

import { BasicData } from '../models/basicData';
import { Character } from './character';

export class SkinInput {
    skinCharId?: string;
}

@ObjectType({ implements: BasicData })
export class Skin extends BasicData implements SkinInput {
    @Field(() => ID, {
        description: '소속된 케릭터 정보',
        nullable: true,
    })
    skinCharId?: string;

    @Field(() => Character, {
        description: '착용 케릭터 정보',
        nullable: true,
    })
    async character?(): Promise<Character | undefined> {
        let skinCharId = this.skinCharId;
        if (!skinCharId) {
            skinCharId = (this as any)._doc.skinCharId;
        }
        if (!skinCharId) {
            return;
        }
        const char = await BasicDataModel.findOne({
            _id: skinCharId,
            type: BasicDataType.CHARACTER,
        }).exec();
        return char as Character;
    }
}
