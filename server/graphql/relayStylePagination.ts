import { Field, ObjectType, Int, ID, ClassType } from 'type-graphql';

@ObjectType()
export class PageInfo {
    @Field({ nullable: true })
    endCursor?: string;
    @Field(() => Int, { nullable: true })
    totalPages?: number;
    @Field(() => Boolean, { defaultValue: false })
    hasNextPage!: boolean;
    @Field(() => Boolean, { nullable: true })
    hasPrevPage?: boolean;
    @Field(() => Int, { nullable: true })
    prevPage?: number | null;
    @Field(() => Int, { nullable: true })
    nextPage?: number | null;
}

export interface EdgesInterface<T> {
    node: T;
    cursor: string;
}

export interface RelayStylePaginationInterface<T> {
    edges?: EdgesInterface<T>[];
    pageInfo?: PageInfo;
    data?: () => Array<T>;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function RelayStylePagination<T>(itemClass: ClassType<T>) {
    @ObjectType({ isAbstract: true })
    abstract class Edges<T> implements EdgesInterface<T> {
        @Field(() => itemClass, { nullable: false })
        node!: T;
        @Field(() => ID, { nullable: false })
        cursor!: string;
    }

    @ObjectType({ isAbstract: true })
    abstract class RelayStylePagination
        implements RelayStylePaginationInterface<T> {
        @Field(() => [Edges], { defaultValue: [] })
        edges?: Edges<T>[] = [];
        @Field(() => PageInfo)
        pageInfo?: PageInfo;
        @Field(() => [itemClass])
        data?(): Array<T> {
            const data = this.edges?.map((e) => e.node);
            return data ? data : [];
        }
    }
    return RelayStylePagination;
}
