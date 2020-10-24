import {
    Resolver,
    Mutation,
    Field,
    ObjectType,
    Int,
    InputType,
    InterfaceType,
    ID,
    Authorized,
    Arg,
    registerEnumType,
} from 'type-graphql';
import { Min, Max } from 'class-validator';
import GroupModels from '../../models/group';
import CharacterModels from '../../models/character';

enum TargetType {
    CHARACTERL = 'CHARACTERL',
    GROUP = 'GROUP',
}

registerEnumType(TargetType, {
    name: 'TargetType',
    description: '타겟 타입',
});

@ObjectType()
export class Like {
    @Field(() => ID, {
        name: 'id',
        description: 'ID',
        nullable: true,
    })
    _id?: string;
    @Field(() => ID, {
        description: '유저 ID',
        nullable: true,
    })
    user?: string;
    @Field(() => ID, {
        description: '타겟 ID',
        nullable: true,
    })
    target?: string;
    @Field(() => TargetType, {
        description: '타겟 타입',
        nullable: true,
    })
    type?: TargetType;
    @Field(() => Int, {
        description: '(0:선택안함, 1:좋아요, -1:싫어요)',
        nullable: false,
    })
    @Min(-1)
    @Max(1)
    link!: number;
    @Field({
        description: '수정일',
        nullable: true,
    })
    updateAt?: Date;
}

@ObjectType()
export class LikeData {
    @Field(() => ID, {
        description: '타겟 ID',
        nullable: true,
    })
    target?: string;
    @Field(() => TargetType, {
        description: '타겟 타입',
        nullable: true,
    })
    type?: TargetType;
    @Field(() => Int, { description: '좋아요', nullable: true })
    link?: number;
    @Field(() => Int, { description: '싫어요', nullable: true })
    notLink?: number;
}

@Resolver()
export default class GroupResolver {}
