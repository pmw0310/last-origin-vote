import { Field, ID, Int, ObjectType } from 'type-graphql';
import { Max, Min } from 'class-validator';

import { BasicUnion } from './unionType';
import { Character } from './character';
import { Group } from './group';
import { PageInfo } from '../relayStylePagination';

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
    @Field(() => Int, { description: '좋아요', nullable: false })
    like!: number;
    @Field(() => Boolean, { description: '좋아요 선택 상태', nullable: true })
    state?: boolean;
}

@ObjectType()
export class LikeRanking {
    @Field(() => BasicUnion, { description: '데이터', nullable: false })
    data!: Character | Group;
    @Field(() => Int, { description: '랭킹 (타입별)', nullable: false })
    ranking!: number;
    @Field(() => Int, { description: '좋아요', nullable: false })
    like!: number;
}

@ObjectType()
export class LikeRankingData {
    @Field(() => [LikeRanking])
    likeRanking?: Array<LikeRanking>;
    @Field(() => PageInfo)
    pageInfo?: PageInfo;
}
