import {
    AccountCircle as AccountCircleIcon,
    Assignment as AssignmentIcon,
    Close as CloseIcon,
    Search as SearchIcon,
} from '@material-ui/icons';
import { CharacterInterface, GroupInterface } from 'Module';
import {
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputBase,
    MenuItem,
    Paper,
    Select,
} from '@material-ui/core';
import { FeedbackType, useDialogState } from '../components/Feedback';
import React, { useEffect, useState } from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { likeAtom, likeDataType } from '../components/common/LikeButton';

import Item from '../components/ListItem';
import Pagination from '../components/common/Pagination';
import Recommend from '../components/Recommend';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';

const AddFabTop = styled.div`
    position: fixed;
    bottom: 28px;
    right: 28px;
`;

export const SearchRoot = styled(Paper)`
    margin: 12px;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    width: 400;
`;

export const SearchIconButton = styled(IconButton)`
    padding: 10;
`;

export const SearchInput = styled(InputBase)`
    flex: 1;
    margin-left: 8px;
`;

export const TypeForm = styled(FormControl)`
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
        $search: String!
        $sort: String!
        $order: OrderType!
    ) {
        get(
            page: $page
            limit: 15
            focus: $focus
            search: $search
            sort: $sort
            order: $order
        ) {
            data {
                ... on Character {
                    id
                    name
                    profileImage
                    tag
                    type
                    charGrade
                    charType
                    charRole
                    charClass
                    charArm
                    charStature
                    charWeight
                    charIsAgs
                    group {
                        name
                        profileImage
                    }
                    likeStats {
                        like
                    }
                    like
                }
                ... on Group {
                    id
                    name
                    profileImage
                    tag
                    type
                    character {
                        id
                        name
                        profileImage
                    }
                    likeStats {
                        like
                    }
                    like
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
        auth: authChecker(roles: ["set"])
    }
`;

const REMOVE_CHARACTER = gql`
    mutation removeCharacter($id: ID!) {
        removeCharacter(id: $id)
    }
`;

const CharacterList = (): JSX.Element => {
    const dispatch = useDialogState();

    const [page, setPage] = useState<number>(1);
    const [focus, setFocus] = useState<string>('CHARACTER');
    const [sort, setSort] = useState<string>('name');
    const [order, setOrder] = useState<string>('ASC');
    const [search, setSearch] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [update, setUpdate] = useState<boolean>(false);

    const router = useRouter();

    const [removeId, setremoveId] = useState<string>('');
    const [removeCharacter] = useMutation(REMOVE_CHARACTER);
    const [getList, { data: listData, loading }] = useLazyQuery(GET_LIST, {
        fetchPolicy: 'no-cache',
    });

    const [like, setLikeData] = useRecoilState(likeAtom);

    const { data: auth, loading: authLoding } = useQuery(AUTH_CHECKER, {
        fetchPolicy: 'no-cache',
    });

    useEffect(() => {
        if (!loading && listData) {
            setUpdate(true);
        }
    }, [listData, loading]);

    useEffect(() => {
        if (!update) {
            return;
        }

        const {
            get: { data },
        } = listData;
        const likeData: likeDataType = { ...like };

        for (const {
            id,
            like: state,
            likeStats: { like },
        } of data) {
            likeData[id] = { like, state: state === 1 };
        }
        setLikeData(likeData);
        setUpdate(false);
    }, [like, listData, loading, setLikeData, update]);

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
            order,
        };

        switch (event.target.name) {
            case 'focus':
                setFocus(value);
                option.focus = value;

                if (value === 'GROUP') {
                    setSort('name');
                    option.sort = 'name';
                }
                break;
            case 'sort':
                setSort(value);
                option.sort = value;
                break;
            case 'order':
                setOrder(value);
                option.order = value;
                break;
        }

        setPage(1);
        updatePage(option);
    };

    const handleSearchKeyPress = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setPage(1);
            updatePage({ page: 1 });
        }
    };

    const handleSearchButton = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setPage(1);
        updatePage({ page: 1 });
    };

    const handleSearchClearButton = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        if (search) {
            setSearch('');
            setPage(1);
            updatePage({ page: 1, search: '' });
        }
    };

    const updatePage = (option?: {
        page?: number;
        focus?: string;
        search?: string;
        order?: string;
    }): void => {
        getList({
            variables: {
                page,
                focus,
                search,
                sort,
                order,
                ...option,
            },
        });
    };

    const nextPage = (): void => {
        if (!listData?.get?.pageInfo?.hasNextPage) {
            return;
        }

        setPage((page) => page + 1);
        updatePage({ page: page + 1 });
    };

    const prevPage = (): void => {
        if (!listData?.get?.pageInfo?.hasPrevPage) {
            return;
        }

        setPage((page) => page - 1);
        updatePage({ page: page - 1 });
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
            <Recommend />
            <Grid container spacing={1}>
                <Grid item lg={2} md={4}>
                    <TypeForm variant="outlined">
                        <Select
                            value={focus}
                            name="focus"
                            onChange={handleSelectChange}
                            label="유형"
                        >
                            <MenuItem value={'CHARACTER'}>캐릭터</MenuItem>
                            <MenuItem value={'GROUP'}>부대</MenuItem>
                        </Select>
                    </TypeForm>
                </Grid>
                <Grid item lg={2} md={4}>
                    <TypeForm variant="outlined">
                        {focus === 'CHARACTER' && (
                            <Select
                                value={sort}
                                name="sort"
                                onChange={handleSelectChange}
                                label="정렬"
                            >
                                <MenuItem value={'name'}>이름</MenuItem>
                                <MenuItem value={'charNumber'}>번호</MenuItem>
                                <MenuItem value={'charGrade'}>등급</MenuItem>
                                <MenuItem value={'charStature'}>신장</MenuItem>
                                <MenuItem value={'charWeight'}>체중</MenuItem>
                            </Select>
                        )}
                        {focus === 'GROUP' && (
                            <Select
                                value={sort}
                                name="sort"
                                onChange={handleSelectChange}
                                label="정렬"
                            >
                                <MenuItem value={'name'}>이름</MenuItem>
                            </Select>
                        )}
                    </TypeForm>
                </Grid>
                <Grid item lg={2} md={4}>
                    <TypeForm variant="outlined">
                        <Select
                            value={order}
                            name="order"
                            onChange={handleSelectChange}
                            label="정렬 순서"
                        >
                            <MenuItem value={'ASC'}>오름차순</MenuItem>
                            <MenuItem value={'DESC'}>내림차순</MenuItem>
                        </Select>
                    </TypeForm>
                </Grid>
                <Grid item lg md>
                    <SearchRoot component="form">
                        <SearchIconButton
                            aria-label="search"
                            onClick={handleSearchButton}
                        >
                            <SearchIcon />
                        </SearchIconButton>
                        <SearchInput
                            placeholder="검색..."
                            inputProps={{ 'aria-label': 'search' }}
                            value={search}
                            onChange={handleSearchChange}
                            onKeyPress={handleSearchKeyPress}
                        />
                        <SearchIconButton
                            aria-label="clear"
                            onClick={handleSearchClearButton}
                        >
                            <CloseIcon />
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
                            auth={auth?.auth}
                            removeDialogOpen={handleDialogOpen}
                        />
                    ),
                )}
            {listData &&
                listData.get.data.length > 0 &&
                !loading &&
                !authLoding && (
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

            {!authLoding && auth?.auth && (
                <AddFabTop>
                    <SpeedDial
                        ariaLabel="AddSpeedDial"
                        hidden={!auth?.auth}
                        icon={<SpeedDialIcon />}
                        onClose={handleClose}
                        onOpen={handleOpen}
                        open={open}
                        direction="up"
                    >
                        <SpeedDialAction
                            icon={<AccountCircleIcon />}
                            tooltipTitle="케릭터 추가"
                            onClick={() => {
                                handleClose();
                                router.push('/character/add');
                            }}
                        />
                        <SpeedDialAction
                            icon={<AssignmentIcon />}
                            tooltipTitle="부대 추가"
                            onClick={() => {
                                handleClose();
                                router.push('/group/add');
                            }}
                        />
                    </SpeedDial>
                </AddFabTop>
            )}
        </>
    );
};

export default CharacterList;
