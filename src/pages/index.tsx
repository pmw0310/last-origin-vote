import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import Item from '../components/ListItem';
import { CharacterInterface, GroupInterface, LikeStats } from 'Module';
import {
    Paper,
    IconButton,
    InputBase,
    Grid,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
} from '@material-ui/core';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import {
    Search as SearchIcon,
    AccountCircle as AccountCircleIcon,
    Assignment as AssignmentIcon,
} from '@material-ui/icons';
import styled from 'styled-components';
import Pagination from '../components/common/Pagination';
import { useDialogState, FeedbackType } from '../components/Feedback';

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
    query getList(
        $page: Int!
        $focus: FocusType!
        $search: String
        $sort: SortType!
    ) {
        get(
            page: $page
            limit: 15
            focus: $focus
            search: $search
            sort: $sort
        ) {
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
    const [sort, setSort] = useState<string>('NUMBER');
    const [search, setSearch] = useState<string>('');
    const [open, setOpen] = React.useState<boolean>(false);

    const router = useRouter();

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
    const handleSelectChange = (
        event: React.ChangeEvent<{ name?: string; value: unknown }>,
    ) => {
        const value: string = event.target.value as string;
        const option = {
            page: 1,
            focus,
            sort,
        };

        switch (event.target.name) {
            case 'focus':
                setFocus(() => value);
                option.focus = value;
                break;
            case 'sort':
                setSort(() => value);
                option.sort = value;
                break;
        }
        setPage(() => 1);
        updatePage(option);
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
                sort,
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

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <>
            <Grid container spacing={1}>
                <Grid item lg={2} md={6}>
                    <TypeForm variant="outlined">
                        <Select
                            value={focus}
                            name="focus"
                            onChange={handleSelectChange}
                            label="유형"
                        >
                            <MenuItem value={'ALL'}>모두</MenuItem>
                            <MenuItem value={'CHARACTER'}>캐릭터</MenuItem>
                            <MenuItem value={'GROUP'}>부대</MenuItem>
                        </Select>
                    </TypeForm>
                </Grid>
                <Grid item lg={2} md={6}>
                    <TypeForm variant="outlined">
                        <Select
                            value={sort}
                            name="sort"
                            onChange={handleSelectChange}
                            label="검색"
                        >
                            <MenuItem value={'NUMBER'}>번호순</MenuItem>
                            <MenuItem value={'LIKE'}>좋아요순</MenuItem>
                            <MenuItem value={'NOT_LIKE'}>싫어요순</MenuItem>
                        </Select>
                    </TypeForm>
                </Grid>
                <Grid item lg={8} md={12}>
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
            {listData && !loading && !authLoding && (
                <Pagination
                    onNext={nextPage}
                    onPrev={prevPage}
                    page={page}
                    hasNextPage={listData?.get?.pageInfo?.hasNextPage}
                    hasPrevPage={listData?.get?.pageInfo?.hasPrevPage}
                />
            )}
            {loading && (
                <Progress>
                    <CircularProgress />
                </Progress>
            )}

            {!authLoding && (auth?.characterAuth || auth?.groupAuth) && (
                <AddFabTop>
                    <SpeedDial
                        ariaLabel="AddSpeedDial"
                        hidden={!auth?.characterAuth && !auth?.groupAuth}
                        icon={<SpeedDialIcon />}
                        onClose={handleClose}
                        onOpen={handleOpen}
                        open={open}
                        direction="up"
                    >
                        {auth?.characterAuth && (
                            <SpeedDialAction
                                icon={<AccountCircleIcon />}
                                tooltipTitle="케릭터 추가"
                                onClick={() => {
                                    handleClose();
                                    router.push('/character/add');
                                }}
                            />
                        )}
                        {auth?.groupAuth && (
                            <SpeedDialAction
                                icon={<AssignmentIcon />}
                                tooltipTitle="부대 추가"
                                onClick={() => {
                                    handleClose();
                                    router.push('/group/add');
                                }}
                            />
                        )}
                    </SpeedDial>
                </AddFabTop>
            )}
        </>
    );
};

export default CharacterList;
