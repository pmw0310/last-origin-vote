import React, { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Item from '../components/CharacterItem';
import { CharacterInterface } from 'Module';

const CHARACTER_LIST = gql`
    query($page: Int!) {
        getCharacter(page: $page) {
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
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const onLoadMore = async () => {
        fetchMore({
            variables: {
                page: page + 1,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                console.log(page, prev, fetchMoreResult);
                setPage(page + 1);

                if (
                    fetchMoreResult &&
                    fetchMoreResult.getCharacter.length > 0
                ) {
                    return Object.assign({}, prev, {
                        getCharacter: [
                            ...prev.getCharacter,
                            ...fetchMoreResult.getCharacter,
                        ],
                    });
                }

                setMore(false);
                return prev;
            },
        });

        setPage(page + 1);
    };

    return loading ? (
        <div />
    ) : (
        <div>
            <Link href="/b" as="/b">
                <a>b</a>
            </Link>
            <InfiniteScroll
                dataLength={data.getCharacter.length}
                next={onLoadMore}
                hasMore={more}
                loader={<h4>Loading...</h4>}
            >
                {data.getCharacter.map((data: CharacterInterface) => (
                    <Item data={data} key={data.id} />
                ))}
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
