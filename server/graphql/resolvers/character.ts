import {
    Resolver,
    Query,
    // Mutation,
    Field,
    ObjectType,
    Int,
    // Authorized,
    registerEnumType,
    Arg,
} from 'type-graphql';
import CharacterModels, {
    CharacterGrade,
    CharacterType,
    CharacterRole,
} from '../../models/character';

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

@ObjectType({ description: '케릭터 데이터' })
export class CharacterData {
    @Field(() => Int, {
        description: '번호',
    })
    number?: number;
    @Field({
        description: '부대',
    })
    unit?: string;
    @Field(() => CharacterGrade, {
        description: '등급',
    })
    grade?: CharacterGrade;
    @Field(() => CharacterGrade, {
        description: '최종 등급',
    })
    lastGrade?: CharacterGrade;
    @Field(() => CharacterType, {
        description: '타입',
    })
    type?: CharacterType;
    @Field(() => CharacterRole, {
        description: '역할',
    })
    role?: CharacterRole;
    @Field({
        description: '클레스',
    })
    class?: string;
    @Field({
        description: '무장',
    })
    arm?: string;
    @Field(() => Int, {
        description: '신장',
    })
    stature?: number;
    @Field(() => Int, {
        description: '체중',
    })
    weight?: number;
    @Field({
        description: '설명',
    })
    description?: string;
}

@ObjectType({ description: '케릭터 정보' })
export class Character {
    @Field({
        description: '이름',
    })
    name?: string;
    @Field({
        description: '프로필 url',
    })
    profileImage?: string;
    @Field({
        description: '생성 날짜',
    })
    createdAt?: Date;
    @Field(() => [String], {
        description: '태그',
        nullable: false,
    })
    tag?: string[];
    @Field(() => CharacterData, {
        description: '케릭터 데이터',
    })
    data?: CharacterData;
}

@Resolver()
export default class CharacterResolver {
    @Query(() => [Character])
    async characterList(
        @Arg('page', () => Int, { nullable: true }) page: number = 1,
        @Arg('limit', () => Int, { nullable: true }) limit: number = 15,
    ): Promise<Character[]> {
        return await CharacterModels.find()
            .sort({ _id: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()
            .exec();
    }

    // @Mutation(() => Boolean)
    // async addCharacter(
    //     @Arg('data', () => Character) data: Character,
    // ): Promise<boolean> {
    //     try {
    //         const char = new CharacterModels(data);
    //         await char.save();
    //         return true;
    //     } catch (e) {
    //         return false;
    //     }
    // }
}
