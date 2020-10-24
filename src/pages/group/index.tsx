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
    query getGroup($endCursor: ID!) {
        get(endCursor: $endCursor, limit: 15, focus: GROUP) {
            edges {
                node {
                    ... on Group {
                        id
                        name
                        image
                        tag
                        character {
                            id
                            name
                            profileImage
                        }
                    }
                }
            }
            pageInfo {
                endCursor
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
    const [endCursor, setEndCursor] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [removeId, setremoveId] = useState<string>('');

    const { data: list, loading, fetchMore } = useQuery(GROUP_LIST, {
        variables: {
            endCursor,
        },
        fetchPolicy: 'no-cache',
    });

    const { data: auth, loading: authLoding } = useQuery(AUTH_CHECKER, {
        fetchPolicy: 'no-cache',
    });

    const [removeGroup] = useMutation(REMOVE_GROUP);

    const handleDialogOpen = (id: string) => {
        setremoveId(id);
        setOpen(true);
    };

    const handleDialogClose = () => {
        setremoveId('');
        setOpen(false);
    };

    const handleOnRemove = async () => {
        handleDialogClose();
        await removeGroup({ variables: { id: removeId } });

        window.location.href = '/group';
    };

    const onLoadMore = () => {
        setEndCursor(list.get.pageInfo.endCursor);

        fetchMore({
            variables: {
                endCursor: list.get.pageInfo.endCursor,
            },
        });
    };

    return loading ? (
        <>Loading...</>
    ) : (
        <>
            <InfiniteScroll
                dataLength={list.get.edges.length}
                next={onLoadMore}
                hasMore={list.get.pageInfo.hasNextPage}
                loader={<h4>Loading...</h4>}
            >
                {list.get.edges.map((data: { node: GroupInterface }) => (
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
