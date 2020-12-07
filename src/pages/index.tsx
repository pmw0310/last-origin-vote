import {
    AccountCircle as AccountCircleIcon,
    Assignment as AssignmentIcon,
    HowToReg as HowToRegIcon,
} from '@material-ui/icons';
import { CharacterInterface, GroupInterface, Type } from '../module';
import {
    CircularProgress,
    FormControl,
    Grid,
    MenuItem,
    Select,
} from '@material-ui/core';
import { FeedbackStateType, dialogAtom } from '../components/Feedback';
import { Order, Sort, listOption } from '../state/list';
import React, { useCallback, useEffect, useState } from 'react';
import Recommend, { RECOMMEND } from '../components/Recommend';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { likeAtom, likeDataType } from '../state/like';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';

import { GetStaticPropsResult } from 'next';
import Item from '../components/ListItem';
import Pagination from '../components/common/Pagination';
import SearchInput from '../components/common/SearchInput';
import { initializeApollo } from '../lib/apollo';
import styled from 'styled-components';
import { useRouter } from 'next/router';

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

export const GET_LIST = gql`
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
                        type
                    }
                    skin {
                        id
                        name
                        profileImage
                        type
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
                        type
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
                        type
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
    useResetRecoilState(listOption);

    const setDialog = useSetRecoilState(dialogAtom);
    const [option, setOption] = useRecoilState(listOption);
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

        switch (event.target.name) {
            case 'focus':
                setOption({
                    ...option,
                    page: 1,
                    focus: value as Type,
                    sort: value !== Type.CHARACTER ? Sort.name : option.sort,
                    search: '',
                });
                break;
            case 'sort':
                setOption({ ...option, page: 1, sort: value as Sort });
                break;
            case 'order':
                setOption({ ...option, page: 1, order: value as Order });
                break;
        }
    };

    const updatePage = useCallback((): void => {
        getList({
            variables: option,
        });
    }, [getList, option]);

    useEffect(() => {
        updatePage();
    }, [option, updatePage]);

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
                            value={option.focus}
                            name="focus"
                            onChange={handleSelectChange}
                            label="유형"
                        >
                            <MenuItem value={Type.CHARACTER}>캐릭터</MenuItem>
                            <MenuItem value={Type.SKIN}>스킨</MenuItem>
                            <MenuItem value={Type.GROUP}>부대</MenuItem>
                        </Select>
                    </TypeForm>
                </Grid>
                <Grid item lg={2} md={4}>
                    <TypeForm variant="outlined">
                        {option.focus === 'CHARACTER' && (
                            <Select
                                value={option.sort}
                                name="sort"
                                onChange={handleSelectChange}
                                label="정렬"
                            >
                                <MenuItem value={Sort.name}>이름</MenuItem>
                                <MenuItem value={Sort.charNumber}>
                                    번호
                                </MenuItem>
                                <MenuItem value={Sort.charGrade}>등급</MenuItem>
                                <MenuItem value={Sort.charStature}>
                                    신장
                                </MenuItem>
                                <MenuItem value={Sort.charWeight}>
                                    체중
                                </MenuItem>
                            </Select>
                        )}
                        {(option.focus === 'GROUP' ||
                            option.focus === 'SKIN') && (
                            <Select
                                value={option.sort}
                                name="sort"
                                onChange={handleSelectChange}
                                label="정렬"
                            >
                                <MenuItem value={Sort.name}>이름</MenuItem>
                            </Select>
                        )}
                    </TypeForm>
                </Grid>
                <Grid item lg={2} md={4}>
                    <TypeForm variant="outlined">
                        <Select
                            value={option.order}
                            name="order"
                            onChange={handleSelectChange}
                            label="정렬 순서"
                        >
                            <MenuItem value={Order.ASC}>오름차순</MenuItem>
                            <MenuItem value={Order.DESC}>내림차순</MenuItem>
                        </Select>
                    </TypeForm>
                </Grid>
                <Grid item lg md>
                    <SearchInput
                        onChange={(search: string) => {
                            setOption({ ...option, page: 1, search });
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
                        page={option.page}
                        onUpdate={(_, page) => {
                            setOption({ ...option, page });
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
