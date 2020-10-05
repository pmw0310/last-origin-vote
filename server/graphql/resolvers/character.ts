import {
    Resolver,
    Query,
    Mutation,
    Field,
    // InterfaceType,
    ObjectType,
    InputType,
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

@InputType('CharacterDataInput')
@ObjectType('CharacterDataObject')
export class CharacterData {
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

@InputType('CharacterInput')
@ObjectType('CharacterObject')
export class Character {
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
    @Field({
        description: '생성 날짜',
        nullable: true,
    })
    createdAt?: Date;
    @Field(() => [String], {
        description: '태그',
        nullable: false,
    })
    tag?: string[];
    @Field(() => CharacterData, {
        description: '케릭터 데이터',
        nullable: true,
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
        const char = await CharacterModels.find()
            .sort({ _id: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean()
            .exec();

        return char as Character[];
    }

    @Mutation(() => Boolean)
    async addCharacter(@Arg('data') data: Character): Promise<boolean> {
        try {
            const char = new CharacterModels(data);
            await char.save();
            return true;
        } catch (e) {
            return false;
        }
    }
}
