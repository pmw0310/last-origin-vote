import { Field, ObjectType, Int, ID } from 'type-graphql';
import { Min, Max } from 'class-validator';

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
    @Field(() => Int, { description: '싫어요', nullable: false })
    notLike!: number;
}
