/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field, ObjectType, Int, Float, ID } from 'type-graphql';
import BasicDataModel, {
    CharacterGrade,
    CharacterType,
    CharacterRole,
    BasicDataType,
} from '../../models/basicData';
import { BasicData } from '../models/basicData';
import { Group } from './group';

export class CharacterInput {
    charNumber?: number;
    charGroupId?: string;
    charGrade?: CharacterGrade;
    charLastGrade?: CharacterGrade;
    charType?: CharacterType;
    charRole?: CharacterRole;
    charClass?: string;
    charArm?: string;
    charStature?: number;
    charWeight?: number;
    charIsAgs?: boolean;
}

@ObjectType({ implements: BasicData })
export class Character extends BasicData implements CharacterInput {
    @Field(() => Int, {
        description: '번호',
        nullable: true,
    })
    charNumber?: number;
    @Field(() => ID, {
        description: '부대 ID',
        nullable: true,
    })
    charGroupId?: string;
    @Field(() => Int, {
        description: '등급',
        nullable: true,
    })
    charGrade?: number;
    @Field(() => Int, {
        description: '최종 등급',
        nullable: true,
    })
    charLastGrade?: number;
    @Field(() => Int, {
        description: '타입',
        nullable: true,
    })
    charType?: number;
    @Field(() => Int, {
        description: '역할',
        nullable: true,
    })
    charRole?: number;
    @Field({
        description: '클레스',
        nullable: true,
    })
    charClass?: string;
    @Field({
        description: '무장',
        nullable: true,
    })
    charArm?: string;
    @Field(() => Float, {
        description: '신장',
        nullable: true,
    })
    charStature?: number;
    @Field(() => Float, {
        description: '체중',
        nullable: true,
    })
    charWeight?: number;
    @Field(() => Boolean, {
        description: 'AGS 로봇 여부',
        nullable: true,
    })
    charIsAgs?: boolean;

    @Field(() => Group, {
        description: '소속된 부대 정보',
        nullable: true,
    })
    async group?(): Promise<Group | undefined> {
        let groupId = this.charGroupId;
        if (!groupId) {
            groupId = (this as any)._doc.charGroupId;
        }
        if (!groupId) {
            return;
        }
        const group = await BasicDataModel.findOne({
            _id: groupId,
            type: BasicDataType.GROUP,
        }).exec();
        return group as Group;
    }
}
