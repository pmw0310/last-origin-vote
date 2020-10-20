import React, { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery, useMutation } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Item from '../../components/ListItem';
import { GroupInterface } from 'Module';
import {
    Fab,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';
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
                    image
                    tag
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
`;

const AUTH_CHECKER = gql`
    query authChecker {
        authChecker(roles: ["group"])
    }
`;

const REMOVE_GROUP = gql`
    mutation removeGroup($id: ID!) {
        removeGroup(id: $id)
    }
`;

const GroupList = (): JSX.Element => {
    const [page, setPage] = useState<number>(1);
    const [open, setOpen] = useState<boolean>(false);
    const [removeId, setremoveId] = useState<string>('');

    const { data: list, loading, fetchMore } = useQuery(GROUP_LIST, {
        variables: {
            page,
        },
        fetchPolicy: 'no-cache',
    });

    const { data: auth, loading: authLoding } = useQuery(AUTH_CHECKER, {
        fetchPolicy: 'no-cache',
    });

    const [removeGroup] = useMutation(REMOVE_GROUP);

    const handleDialogOpen = (id: string) => () => {
        setremoveId(id);
        setOpen(true);
    };

    const handleDialogClose = () => {
        setOpen(false);
    };

    const handleOnRemove = async () => {
        handleDialogClose();
        await removeGroup({ variables: { id: removeId } });

        window.location.href = '/group';
    };

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
                        auth={!authLoding && (auth.authChecker as boolean)}
                        removeDialogOpen={handleDialogOpen}
                        type="group"
                    />
                ))}
            </InfiniteScroll>

            {!authLoding && auth.authChecker && (
                <>
                    <Dialog
                        open={open}
                        onClose={handleDialogClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            그룹을 삭제 하시겠습니까?
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                그룹을 삭제 하시겠습니까?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose} color="primary">
                                아니오
                            </Button>
                            <Button
                                onClick={handleOnRemove}
                                color="primary"
                                autoFocus
                            >
                                예
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <AddFabTop>
                        <Link href="/group/add">
                            <AddFab aria-label="add" color="primary">
                                <AddIcon />
                            </AddFab>
                        </Link>
                    </AddFabTop>
                </>
            )}
        </>
    );
};

export default GroupList;
