import { InputType, Field, Int, Float, ID } from 'type-graphql';
import {
    CharacterGrade,
    CharacterType,
    CharacterRole,
} from '../../models/basicData';
import { BasicDataType } from '../../models/basicData';
import { BasicDataInput } from './basicData';
import { CharacterInput } from './character';
import { GroupInput } from './group';

@InputType()
export class InputData implements BasicDataInput, CharacterInput, GroupInput {
    @Field({
        description: '이름',
        nullable: true,
    })
    name?: string;
    @Field({
        description: '프로필 이미지 url',
        nullable: true,
    })
    profileImage?: string;
    @Field(() => [String], {
        description: '태그',
        nullable: 'itemsAndList',
        defaultValue: [],
    })
    tag?: string[];
    @Field({
        description: '설명',
        nullable: true,
    })
    description?: string;
    @Field(() => BasicDataType, {
        description: '베이스 타입',
        nullable: false,
    })
    type!: BasicDataType;

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
}
