/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Field,
    ObjectType,
    Int,
    Float,
    ID,
    registerEnumType,
} from 'type-graphql';
import BasicDataModel, {
    CharacterGrade,
    CharacterType,
    CharacterRole,
    BasicDataType,
} from '../../models/basicData';
import { BasicData } from '../models/basicData';
import { Group } from './group';

registerEnumType(CharacterGrade, {
    name: 'CharacterGrade',
    description: '케릭터 등급',
});

registerEnumType(CharacterType, {
    name: 'CharacterType',
    description: '케릭터 타입',
});

registerEnumType(CharacterRole, {
    name: 'CharacterRole',
    description: '케릭터 역할',
});

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
    @Field(() => CharacterGrade, {
        description: '등급',
        nullable: true,
    })
    charGrade?: CharacterGrade;
    @Field(() => CharacterGrade, {
        description: '최종 등급',
        nullable: true,
    })
    charLastGrade?: CharacterGrade;
    @Field(() => CharacterType, {
        description: '타입',
        nullable: true,
    })
    charType?: CharacterType;
    @Field(() => CharacterRole, {
        description: '역할',
        nullable: true,
    })
    charRole?: CharacterRole;
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
