import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import Item from '../components/ListItem';
import { CharacterInterface, GroupInterface, LikeStats } from 'Module';
import {
    Fab,
    Paper,
    IconButton,
    InputBase,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
} from '@material-ui/core';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Search as SearchIcon,
} from '@material-ui/icons';
import styled from 'styled-components';
import Pagination from '../components/common/Pagination';
import { useDialogState, FeedbackType } from '../components/Feedback';

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

const SearchRoot = styled(Paper)`
    margin: 12px;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    width: 400;
`;

const SearchIconButton = styled(IconButton)`
    padding: 10;
`;

const SearchInput = styled(InputBase)`
    flex: 1;
    margin-left: 8px;
`;

const TypeForm = styled(FormControl)`
    background-color: white;
    width: 100%;
    margin: 12px !important;
    position: relative;
    top: 5px;
    legend {
        display: none;
    }
    .MuiSelect-selectMenu {
        padding: 15px !important;
    }
`;

const Progress = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50vh;
`;

const GET_LIST = gql`
    query getList($page: Int!, $focus: FocusType!, $search: String) {
        get(page: $page, limit: 15, focus: $focus, search: $search) {
            data {
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
            pageInfo {
                hasPrevPage
                hasNextPage
            }
        }
    }
`;

const AUTH_CHECKER = gql`
    query authChecker {
        characterAuth: authChecker(roles: ["character"])
        groupAuth: authChecker(roles: ["group"])
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
    const dispatch = useDialogState();

    const [page, setPage] = useState<number>(1);
    const [focus, setFocus] = useState<string>('CHARACTER');
    const [search, setSearch] = useState<string>('');

    const [removeId, setremoveId] = useState<string>('');
    const [removeCharacter] = useMutation(REMOVE_CHARACTER);
    const [setLike] = useMutation<{ setLike: LikeStats }>(SET_LIKE);
    const [getList, { data: listData, loading }] = useLazyQuery(GET_LIST, {
        fetchPolicy: 'no-cache',
    });

    const { data: auth, loading: authLoding } = useQuery(AUTH_CHECKER, {
        fetchPolicy: 'no-cache',
    });

    const handleDialogOpen = (id: string) => {
        setremoveId(id);
        dispatch({
            type: FeedbackType.OPEN,
            option: {
                title: '삭제 하시겠습니까?',
                yesButtonText: '예',
                noButtonText: '아니오',
                onAgree: () => {
                    handleOnRemove();
                },
            },
        });
    };

    const handleOnRemove = async () => {
        await removeCharacter({ variables: { id: removeId } });
        updatePage();
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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };
    const handleFocusChange = (
        event: React.ChangeEvent<{ name?: string; value: unknown }>,
    ) => {
        const focus = event.target.value as string;
        setFocus(() => focus);
        setPage(() => 1);
        updatePage({ page: 1, focus });
    };

    const handleSearchKeyPress = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setPage(() => 1);
            updatePage({ page: 1 });
        }
    };

    const updatePage = (option?: {
        page?: number;
        focus?: string;
        search?: string;
    }): void => {
        getList({
            variables: {
                page,
                focus,
                search,
                ...option,
            },
        });
    };

    const nextPage = (): void => {
        if (!listData?.get?.pageInfo?.hasNextPage) {
            return;
        }

        setPage((page) => page + 1);
        updatePage();
    };

    const prevPage = (): void => {
        if (!listData?.get?.pageInfo?.hasPrevPage) {
            return;
        }

        setPage((page) => page - 1);
        updatePage();
    };

    useEffect(() => {
        updatePage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={2}>
                    <TypeForm variant="outlined">
                        <Select
                            value={focus}
                            onChange={handleFocusChange}
                            label="유형"
                        >
                            <MenuItem value={'ALL'}>모두</MenuItem>
                            <MenuItem value={'CHARACTER'}>케릭터</MenuItem>
                            <MenuItem value={'GROUP'}>부대</MenuItem>
                        </Select>
                    </TypeForm>
                </Grid>
                <Grid item xs={10}>
                    <SearchRoot component="form">
                        <SearchInput
                            placeholder="검색"
                            inputProps={{ 'aria-label': 'search' }}
                            value={search}
                            onChange={handleSearchChange}
                            onKeyPress={handleSearchKeyPress}
                        />
                        <SearchIconButton type="submit" aria-label="search">
                            <SearchIcon />
                        </SearchIconButton>
                    </SearchRoot>
                </Grid>
            </Grid>
            <Pagination
                onNext={nextPage}
                onPrev={prevPage}
                page={page}
                hasNextPage={listData?.get?.pageInfo?.hasNextPage}
                hasPrevPage={listData?.get?.pageInfo?.hasPrevPage}
            />
            {listData &&
                !loading &&
                !authLoding &&
                listData.get.data.map(
                    (data: CharacterInterface | GroupInterface) => (
                        <Item
                            data={data}
                            key={data.id}
                            auth={
                                (data.__typename === 'Character' &&
                                    auth?.characterAuth) ||
                                (data.__typename === 'Group' && auth?.groupAuth)
                            }
                            removeDialogOpen={handleDialogOpen}
                            onLike={handleOnLike}
                        />
                    ),
                )}
            {loading && (
                <Progress>
                    <CircularProgress />
                </Progress>
            )}
        </>
    );

    // return loading ? (
    //     <>Loading...</>
    // ) : (
    //     <>
    // <SearchRoot component="form">
    //     <SearchInput
    //         placeholder="검색"
    //         inputProps={{ 'aria-label': 'search' }}
    //     />
    //     <SearchIconButton type="submit" aria-label="search">
    //         <SearchIcon />
    //     </SearchIconButton>
    // </SearchRoot>
    //         <InfiniteScroll
    //             dataLength={list.get.edges.length}
    //             next={onLoadMore}
    //             hasMore={list.get.pageInfo.hasNextPage}
    //             loader={<h4>Loading...</h4>}
    //         >
    // {list.get.edges.map((data: { node: CharacterInterface }) => (
    //     <Item
    //         data={data.node}
    //         key={data.node.id}
    //         auth={!authLoding && (auth.authChecker as boolean)}
    //         removeDialogOpen={handleDialogOpen}
    //         type="char"
    //         onLike={handleOnLike}
    //     />
    // ))}
    //         </InfiniteScroll>

    //         {!authLoding && auth.authChecker && (
    //             <>
    //                 <Dialog
    //                     open={open}
    //                     onClose={handleDialogClose}
    //                     aria-labelledby="alert-dialog-title"
    //                     aria-describedby="alert-dialog-description"
    //                 >
    //                     <DialogTitle id="alert-dialog-title">
    //                         케릭터을 삭제 하시겠습니까?
    //                     </DialogTitle>
    //                     <DialogContent>
    //                         <DialogContentText id="alert-dialog-description">
    //                             케릭터을 삭제 하시겠습니까?
    //                         </DialogContentText>
    //                     </DialogContent>
    //                     <DialogActions>
    //                         <Button onClick={handleDialogClose} color="primary">
    //                             아니오
    //                         </Button>
    //                         <Button
    //                             onClick={handleOnRemove}
    //                             color="primary"
    //                             autoFocus
    //                         >
    //                             예
    //                         </Button>
    //                     </DialogActions>
    //                 </Dialog>
    //                 <AddFabTop>
    //                     <Link href="/char/add">
    //                         <AddFab aria-label="add" color="primary">
    //                             <AddIcon />
    //                         </AddFab>
    //                     </Link>
    //                 </AddFabTop>
    //             </>
    //         )}
    //     </>
    // );
};

export default CharacterList;
