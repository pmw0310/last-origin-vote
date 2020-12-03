import {
    AccountCircle as AccountCircleIcon,
    Assignment as AssignmentIcon,
    HowToReg as HowToRegIcon,
} from '@material-ui/icons';
import { CharacterInterface, GroupInterface } from 'Module';
import {
    CircularProgress,
    FormControl,
    Grid,
    MenuItem,
    Select,
} from '@material-ui/core';
import { FeedbackStateType, dialogAtom } from '../components/Feedback';
import React, { useEffect, useState } from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { likeAtom, likeDataType } from '../components/common/LikeButton';

import { GetStaticPropsResult } from 'next';
import Item from '../components/ListItem';
import Pagination from '../components/common/Pagination';
import { RECOMMEND } from '../components/Recommend';
import SearchInput from '../components/common/SearchInput';
import dynamic from 'next/dynamic';
import { initializeApollo } from '../lib/apollo';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useSetRecoilState } from 'recoil';

const Recommend = dynamic(() => import('../components/Recommend'), {
    ssr: false,
});

const AddFabTop = styled.div`
    position: fixed;
    bottom: 28px;
    right: 28px;
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
                    skin {
                        id
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
                    member {
                        id
                        name
                        profileImage
                    }
                    likeStats {
                        like
                    }
                    like
                }
                ... on Skin {
                    id
                    name
                    profileImage
                    tag
                    type
                    character {
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
                totalPages
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

interface ListProps {
    recommend: Array<CharacterInterface>;
}

const List: React.FC<ListProps> = ({ recommend }): JSX.Element => {
    const setDialog = useSetRecoilState(dialogAtom);

    const [page, setPage] = useState<number>(1);
    const [focus, setFocus] = useState<string>('CHARACTER');
    const [sort, setSort] = useState<string>('name');
    const [order, setOrder] = useState<string>('ASC');
    const [open, setOpen] = useState<boolean>(false);
    const [update, setUpdate] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');

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
        setDialog({
            state: FeedbackStateType.OPEN,
            title: '삭제 하시겠습니까?',
            yesButtonText: '예',
            noButtonText: '아니오',
            onAgree: () => {
                handleOnRemove();
            },
        });
    };

    const handleOnRemove = async () => {
        await removeCharacter({ variables: { id: removeId } });
        updatePage();
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

                if (value === 'GROUP' || value === 'SKIN') {
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
            <Recommend data={recommend} />
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
                            <MenuItem value={'SKIN'}>스킨</MenuItem>
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
                        {(focus === 'GROUP' || focus === 'SKIN') && (
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
                    <SearchInput
                        onChange={(search: string) => {
                            setPage(1);
                            setSearch(search);
                            updatePage({ page: 1, search });
                        }}
                    />
                </Grid>
            </Grid>
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
                        count={listData?.get?.pageInfo?.totalPages}
                        page={page}
                        onUpdate={(_, page) => {
                            setPage(page);
                            updatePage({ page });
                        }}
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
                            icon={<HowToRegIcon />}
                            tooltipTitle="스킨 추가"
                            onClick={() => {
                                handleClose();
                                router.push('/skin/add');
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

export const getStaticProps = async (): Promise<
    GetStaticPropsResult<ListProps>
> => {
    const apolloClient = initializeApollo();

    const {
        data: { recommend },
    } = await apolloClient.query({
        query: RECOMMEND,
    });

    return {
        props: {
            recommend,
        },
    };
};

export default List;
