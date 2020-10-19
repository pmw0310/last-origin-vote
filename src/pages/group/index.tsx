import React, { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Item from '../../components/CharacterItem';
import { GroupInterface } from 'Module';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import styled from 'styled-components';

const AddFab = styled(Fab)`
    position: relative;
    margin: 0 auto;
    z-index: 1000;
`;
const AddFabTop = styled.div`
    position: fixed;
    bottom: 28px;
    right: 28px;
`;

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
        fetchPolicy: 'no-cache',
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

            <AddFabTop>
                <Link href="/group/add">
                    <AddFab aria-label="test" color="primary">
                        <AddIcon />
                    </AddFab>
                </Link>
            </AddFabTop>
        </>
    );
};

export default GroupList;
