import React, { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Item from '../components/CharacterItem';
import { CharacterInterface } from 'Module';

const CHARACTER_LIST = gql`
    query GetCharacter($page: Int!) {
        getCharacter(page: $page, limit: 15) {
            edges {
                node {
                    id
                    name
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
`;

export default function Home(): JSX.Element {
    const [page, setPage] = useState<number>(1);

    const { data, loading, fetchMore } = useQuery(CHARACTER_LIST, {
        variables: {
            page,
        },
    });

    const onLoadMore = () => {
        fetchMore({
            variables: {
                page: page + 1,
            },
        });

        setPage(page + 1);
    };

    return loading ? (
        <div>
            <button
                onClick={() => {
                    console.log(data);
                }}
            />
        </div>
    ) : (
        <div>
            <Link href="/b" as="/b">
                <a>b</a>
            </Link>
            <InfiniteScroll
                dataLength={data.getCharacter.edges.length}
                next={onLoadMore}
                hasMore={data.getCharacter.pageInfo.hasNextPage}
                loader={<h4>Loading...</h4>}
            >
                {data.getCharacter.edges.map(
                    (data: { node: CharacterInterface }) => (
                        <Item data={data.node} key={data.node.id} />
                    ),
                )}
            </InfiniteScroll>
        </div>
    );

    // return (
    //     <>
    //         <ul>
    //             <li>
    //                 <Link href="/a" as="/a">
    //                     <a>a</a>
    //                 </Link>
    //             </li>
    //             <li>
    // <Link href="/b" as="/b">
    //     <a>b</a>
    // </Link>
    //             </li>
    //         </ul>
    //     </>
    // );
}
