/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

export function Edges<OBJECT>(objectClass: ClassType<OBJECT>) {
    @ObjectType({ isAbstract: true })
    abstract class Edges {
        @Field(() => objectClass, { nullable: false })
        node!: OBJECT;
        @Field(() => ID, { nullable: false })
        cursor!: string;
    }
    return Edges;
}

export default function RelayStylePagination<OBJECT, EDGES>(
    objectClass: ClassType<OBJECT>,
    edgesClass: ClassType<EDGES>,
) {
    @ObjectType({ isAbstract: true })
    abstract class RelayStylePagination {
        @Field(() => [edgesClass], { defaultValue: [] })
        edges?: EDGES[] = [];
        @Field(() => PageInfo)
        pageInfo?: PageInfo;
        @Field(() => [objectClass])
        data?(): Array<OBJECT> {
            const data = this.edges?.map<OBJECT>((e: any) => e.node);
            return data ? data : [];
        }
    }
    return RelayStylePagination;
}
