import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Item from '../../components/CharacterItem';
import { GroupInterface } from 'Module';

const GROUP_LIST = gql`
    query getGroup($page: Int!) {
        getGroup(page: $page, limit: 15) {
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
        authChecker(roles: ["group"])
    }
`;

const GroupList = (): JSX.Element => {
    const [page, setPage] = useState<number>(1);

    const { data: list, loading, fetchMore } = useQuery(GROUP_LIST, {
        variables: {
            page,
        },
    });

    const onLoadMore = () => {
        const _page = page + 1;

        fetchMore({
            variables: {
                page: _page,
            },
        });

        setPage(_page);
    };

    return loading ? (
        <>Loading...</>
    ) : (
        <>
            <InfiniteScroll
                dataLength={list.getGroup.edges.length}
                next={onLoadMore}
                hasMore={list.getGroup.pageInfo.hasNextPage}
                loader={<h4>Loading...</h4>}
            >
                {list.getGroup.edges.map((data: { node: GroupInterface }) => (
                    <Item
                        data={data.node}
                        key={data.node.id}
                        auth={list.authChecker as boolean}
                    />
                ))}
            </InfiniteScroll>
        </>
    );
};

export default GroupList;
