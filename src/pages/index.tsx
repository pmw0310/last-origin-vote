import React, { useState } from 'react';
import Link from 'next/link';
import { gql, useQuery, useMutation } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Item from '../components/ListItem';
import { CharacterInterface, LikeStats } from 'Module';
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

const CHARACTER_LIST = gql`
    query getCharacter($endCursor: ID!) {
        get(endCursor: $endCursor, limit: 15, focus: CHARACTER) {
            edges {
                node {
                    ... on Character {
                        id
                        name
                        profileImage
                        tag
                        grade
                        type
                        role
                        class
                        arm
                        stature
                        weight
                        group {
                            name
                            image
                        }
                        likeStats {
                            like
                            notLike
                        }
                        like
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

const REMOVE_CHARACTER = gql`
    mutation removeCharacter($id: ID!) {
        removeCharacter(id: $id)
    }
`;

const SET_LIKE = gql`
    mutation setLike($target: ID!, $like: Int!) {
        setLike(target: $target, type: CHARACTER, like: $like) {
            like
            notLike
        }
    }
`;

const CharacterList = (): JSX.Element => {
    const [endCursor, setEndCursor] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [removeId, setremoveId] = useState<string>('');

    const { data: list, loading, fetchMore } = useQuery(CHARACTER_LIST, {
        variables: {
            endCursor,
        },
        fetchPolicy: 'no-cache',
    });

    const { data: auth, loading: authLoding } = useQuery(AUTH_CHECKER, {
        fetchPolicy: 'no-cache',
    });

    const [removeCharacter] = useMutation(REMOVE_CHARACTER);
    const [setLike] = useMutation<{ setLike: LikeStats }>(SET_LIKE);

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
        await removeCharacter({ variables: { id: removeId } });

        window.location.href = '/';
    };

    const onLoadMore = () => {
        setEndCursor(list.get.pageInfo.endCursor);

        fetchMore({
            variables: {
                endCursor: list.get.pageInfo.endCursor,
            },
        });
    };

    const handleOnLike = async (
        id: string,
        like: -1 | 1,
    ): Promise<LikeStats> => {
        const likeData = await setLike({
            variables: { target: id, like },
        });

        return likeData.data?.setLike as LikeStats;
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
                {list.get.edges.map((data: { node: CharacterInterface }) => (
                    <Item
                        data={data.node}
                        key={data.node.id}
                        auth={!authLoding && (auth.authChecker as boolean)}
                        removeDialogOpen={handleDialogOpen}
                        type="char"
                        onLike={handleOnLike}
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
                            케릭터을 삭제 하시겠습니까?
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                케릭터을 삭제 하시겠습니까?
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
                        <Link href="/char/add">
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

export default CharacterList;
