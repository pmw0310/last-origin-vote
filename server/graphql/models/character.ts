/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    InputType,
    Field,
    ObjectType,
    Int,
    ID,
    registerEnumType,
} from 'type-graphql';
import BasicDataModel, {
    CharacterGrade,
    CharacterType,
    CharacterRole,
    BasicDataType,
} from '../../models/basicData';
import { BasicDataInterface, BasicData } from '../models/basicData';
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

@ObjectType({ implements: BasicDataInterface })
@InputType('CharacterInput')
export class CharacterInterface extends BasicDataInterface {
    @Field(() => Int, {
        description: '번호',
        nullable: true,
    })
    number?: number;
    @Field(() => ID, {
        description: '부대 ID',
        nullable: true,
    })
    groupId?: string;
    @Field(() => CharacterGrade, {
        description: '등급',
        nullable: true,
    })
    grade?: CharacterGrade;
    @Field(() => CharacterGrade, {
        description: '최종 등급',
        nullable: true,
    })
    lastGrade?: CharacterGrade;
    @Field(() => CharacterType, {
        description: '타입',
        nullable: true,
    })
    type?: CharacterType;
    @Field(() => CharacterRole, {
        description: '역할',
        nullable: true,
    })
    role?: CharacterRole;
    @Field({
        description: '클레스',
        nullable: true,
    })
    class?: string;
    @Field({
        description: '무장',
        nullable: true,
    })
    arm?: string;
    @Field(() => Int, {
        description: '신장',
        nullable: true,
    })
    stature?: number;
    @Field(() => Int, {
        description: '체중',
        nullable: true,
    })
    weight?: number;
}

@ObjectType({ implements: BasicData })
export class Character extends BasicData {
    @Field(() => Int, {
        description: '번호',
        nullable: true,
    })
    number?: number;
    @Field(() => ID, {
        description: '부대 ID',
        nullable: true,
    })
    groupId?: string;
    @Field(() => CharacterGrade, {
        description: '등급',
        nullable: true,
    })
    grade?: CharacterGrade;
    @Field(() => CharacterGrade, {
        description: '최종 등급',
        nullable: true,
    })
    lastGrade?: CharacterGrade;
    @Field(() => CharacterType, {
        description: '타입',
        nullable: true,
    })
    type?: CharacterType;
    @Field(() => CharacterRole, {
        description: '역할',
        nullable: true,
    })
    role?: CharacterRole;
    @Field({
        description: '클레스',
        nullable: true,
    })
    class?: string;
    @Field({
        description: '무장',
        nullable: true,
    })
    arm?: string;
    @Field(() => Int, {
        description: '신장',
        nullable: true,
    })
    stature?: number;
    @Field(() => Int, {
        description: '체중',
        nullable: true,
    })
    weight?: number;

    @Field(() => Group, {
        description: '소속된 부대 정보',
        nullable: true,
    })
    async group?(): Promise<Group | undefined> {
        let groupId = this.groupId;
        if (!groupId) {
            groupId = (this as any)._doc.groupId;
        }
        if (!groupId) {
            return;
        }
        const group = await BasicDataModel.findOne({
            _id: groupId,
            basicType: BasicDataType.GROUP,
        }).exec();
        return group as Group;
    }
}
