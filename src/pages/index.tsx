import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Item from '../components/CharacterItem';
import { CharacterInterface } from 'Module';

const CHARACTER_LIST = gql`
    query GetCharacter($page: Int!) {
        getCharacter(page: $page) {
            edges {
                node {
                    id
                    name
                }
                cursor
            }
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`;

export default function Home(): JSX.Element {
    const [page, setPage] = useState<number>(1);
    // const [more, setMore] = useState<boolean>(true);

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
            // updateQuery: (prev, { fetchMoreResult }) => {
            //     console.log(page, prev, fetchMoreResult);
            //     setPage(page + 1);

            //     if (
            //         fetchMoreResult &&
            //         fetchMoreResult.getCharacter.length > 0
            //     ) {
            //         return Object.assign({}, prev, {
            //             getCharacter: [
            //                 ...prev.getCharacter,
            //                 ...fetchMoreResult.getCharacter,
            //             ],
            //         });
            //     }

            //     setMore(false);
            //     return prev;
            // },
        });

        setPage(page + 1);
    };

    useEffect(() => {
        console.log(data);

        // setTimeout(() => {
        //     onLoadMore();
        // }, 1000);
    }, [data]);

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
