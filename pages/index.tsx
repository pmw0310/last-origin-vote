import React, { useState } from 'react';
// import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import styled from 'styled-components';

const Item = styled.div`
    height: 300px;
`;

const CHARACTER_LIST = gql`
    query($page: Int!) {
        characterList(page: $page, limit: 5) {
            id
            name
        }
    }
`;

export default function Home(): JSX.Element {
    const [page, setPage] = useState<number>(1);
    const [more, setMore] = useState<boolean>(true);

    const { data, loading, fetchMore } = useQuery(CHARACTER_LIST, {
        variables: {
            page,
        },
    });

    const onLoadMore = async () => {
        fetchMore({
            variables: {
                page: page + 1,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                setPage(page + 1);

                if (
                    fetchMoreResult &&
                    fetchMoreResult.characterList.length > 0
                ) {
                    return Object.assign({}, prev, {
                        characterList: [
                            ...prev.characterList,
                            ...fetchMoreResult.characterList,
                        ],
                    });
                }

                setMore(false);
                return prev;
            },
        });
    };

    return loading ? (
        <div />
    ) : (
        <div>
            <InfiniteScroll
                dataLength={data.characterList.length}
                next={onLoadMore}
                hasMore={more}
                loader={<h4>Loading...</h4>}
            >
                {data.characterList.map(
                    (data: { id: string; name: string }) => (
                        <Item key={data.id}>#{data.name}</Item>
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
    //                 <Link href="/b" as="/b">
    //                     <a>b</a>
    //                 </Link>
    //             </li>
    //         </ul>
    //     </>
    // );
}
