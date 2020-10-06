import {
    Resolver,
    Query,
    Mutation,
    Field,
    ObjectType,
    InputType,
    InterfaceType,
    Int,
    ID,
    Authorized,
    registerEnumType,
    Arg,
    Args,
    ArgsType,
} from 'type-graphql';
import CharacterModels, {
    CharacterGrade,
    CharacterType,
    CharacterRole,
} from '../../models/character';
import { Min } from 'class-validator';

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

@InterfaceType()
@InputType('CharacterInput')
export class CharacterInterface {
    @Field({
        description: '이름',
        nullable: true,
    })
    name?: string;
    @Field({
        description: '프로필 url',
        nullable: true,
    })
    profileImage?: string;
    @Field(() => [String], {
        description: '태그',
        nullable: 'itemsAndList',
        defaultValue: [],
    })
    tag?: string[];
    @Field(() => Int, {
        description: '번호',
        nullable: true,
    })
    number?: number;
    @Field({
        description: '부대',
        nullable: true,
    })
    unit?: string;
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
    @Field({
        description: '설명',
        nullable: true,
    })
    description?: string;
}

@ObjectType({ implements: CharacterInterface })
export class Character extends CharacterInterface {
    @Field(() => ID, {
        name: 'id',
        description: 'ID',
        nullable: true,
    })
    _id?: string;
    @Field({
        description: '생성일',
        nullable: true,
    })
    createdAt?: Date;
    @Field({
        description: '수정일',
        nullable: true,
    })
    updateAt?: Date;
}

@ArgsType()
class CharacterListArgs {
    @Field(() => Int, { defaultValue: 1 })
    @Min(1)
    page?: number;
    @Field(() => Int, { defaultValue: 10 })
    @Min(1)
    limit?: number;
}

@Resolver()
export default class CharacterResolver {
    @Query(() => [Character])
    async characterList(
        @Args() { page, limit }: CharacterListArgs,
    ): Promise<Character[]> {
        const char = await CharacterModels.find()
            .sort({ _id: -1 })
            .limit(limit as number)
            .skip(((page as number) - 1) * (limit as number))
            .lean()
            .exec();

        return char as Character[];
    }

    @Authorized('character')
    @Mutation(() => Character)
    async addCharacter(
        @Arg('data') data: CharacterInterface,
    ): Promise<Character> {
        try {
            const char = new CharacterModels(data);
            await char.save();
            return char;
        } catch (e) {
            throw new Error('generation failure');
        }
    }

    @Authorized('character')
    @Mutation(() => Boolean)
    async removeCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
    ): Promise<boolean> {
        try {
            await CharacterModels.findByIdAndRemove(id).exec();
            return true;
        } catch (e) {
            throw new Error('update failure');
        }
    }

    @Authorized('character')
    @Mutation(() => Character)
    async updateCharacter(
        @Arg('id', () => ID, { nullable: false }) id: string,
        @Arg('data', { nullable: false }) data: CharacterInterface,
    ): Promise<Character> {
        try {
            const update = { $set: { ...data, updateAt: new Date() } };
            const char = await CharacterModels.findByIdAndUpdate(id, update, {
                new: true,
            }).exec();

            if (!char) {
                throw new Error('update failure');
            }

            return char as Character;
        } catch (e) {
            throw new Error('update failure');
        }
    }
}
