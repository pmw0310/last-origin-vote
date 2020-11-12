import React, { useState, useEffect } from 'react';
import EchartsCore from 'echarts-for-react/lib/core';
import echarts, { EChartOption } from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import { gql, useLazyQuery } from '@apollo/client';
import { CharacterInterface, GroupInterface } from 'Module';
import produce from 'immer';
import { Paper, Grid, Select, MenuItem } from '@material-ui/core';
import Pagination from '../components/common/Pagination';
import { SearchRoot, SearchIconButton, SearchInput, TypeForm } from './index';
import { Search as SearchIcon, Close as CloseIcon } from '@material-ui/icons';

const GET_LIKE_RANKING = gql`
    query likeRanking($page: Int!, $focus: BasicDataType!, $search: String) {
        likeRanking(page: $page, focus: $focus, search: $search) {
            likeRanking {
                data {
                    ... on Character {
                        id
                        name
                        profileImage
                    }
                    ... on Group {
                        id
                        name
                        profileImage
                    }
                }
                ranking
                like
                notLike
            }
            pageInfo {
                hasPrevPage
                hasNextPage
            }
        }
    }
`;

type LikeRanking = {
    data: CharacterInterface | GroupInterface;
    ranking: number;
};

const Stats = (): JSX.Element => {
    const [page, setPage] = useState<number>(1);
    const [focus, setFocus] = useState<string>('CHARACTER');
    const [search, setSearch] = useState<string>('');
    const updatePage = (option?: {
        page?: number;
        focus?: string;
        search?: string;
    }): void => {
        getLikeRanking({
            variables: {
                page,
                focus,
                search,
                ...option,
            },
        });
    };
    const nextPage = (): void => {
        if (!likeRanking?.likeRanking?.pageInfo?.hasNextPage) {
            return;
        }

        setPage((page) => page + 1);
        updatePage({ page: page + 1 });
    };

    const prevPage = (): void => {
        if (!likeRanking?.likeRanking?.pageInfo?.hasPrevPage) {
            return;
        }

        setPage((page) => page - 1);
        updatePage({ page: page - 1 });
    };
    const [getLikeRanking, { data: likeRanking, loading }] = useLazyQuery(
        GET_LIKE_RANKING,
        {
            fetchPolicy: 'no-cache',
        },
    );
    const [option, setOption] = useState<EChartOption>({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
            formatter: (params): string => {
                let tooltip = '';
                for (const param of params as EChartOption.Tooltip.Format[]) {
                    tooltip += `${param.marker}${param.seriesName}: ${param.value}<br>`;
                }
                return tooltip;
            },
        },
        grid: {
            top: 45,
            left: 110,
            right: 30,
            bottom: 30,
        },
        legend: {
            data: ['좋아요', '싫어요'],
            top: 15,
        },
        xAxis: {
            type: 'value',
        },
        yAxis: {
            type: 'category',
            inverse: true,
            data: [],
        },
        series: [],
    });

    useEffect(() => {
        getLikeRanking({ variables: { page: 1, focus: 'CHARACTER' } });

        const image = new Image();
        const webpdata =
            'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        image.onerror = () => {
            console.log('no-webp');
        };
        image.onload = () => {
            const result = image.width > 0 && image.height > 0;
            if (result) {
                console.log('webp');
            } else {
                console.log('no-webp');
            }
        };
        image.src = webpdata;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!likeRanking) return;

        const {
            likeRanking: { likeRanking: ranking },
        } = likeRanking;

        const yAxisData = ranking.map((data: LikeRanking) => data.data.id);

        const yAxisRichData = {};

        for (const data of ranking) {
            (yAxisRichData as {
                [key: string]: {
                    height: number;
                    align: string;
                    backgroundColor: { image: string };
                };
            })[data.data.id] = {
                height: 40,
                align: 'center',
                backgroundColor: {
                    image: data.data.profileImage
                        ? data.data.profileImage
                        : 'https://via.placeholder.com/40x40.png?text=No+Image',
                },
            };
        }

        const seriesData: Array<{
            name: string;
            type: string;
            data: Array<string>;
        }> = [
            {
                name: '좋아요',
                type: 'bar',
                data: [],
            },
            {
                name: '싫어요',
                type: 'bar',
                data: [],
            },
        ];

        for (const { like, notLike } of ranking) {
            seriesData[0].data.push(like);
            seriesData[1].data.push(notLike);
        }

        setOption(
            produce(option, (draft) => {
                (draft.yAxis as EChartOption.YAxis).data = yAxisData;
                draft.series = seriesData;
                (draft.yAxis as EChartOption.YAxis).axisLabel = {
                    formatter: (value: string) => {
                        const data = ranking.find(
                            (d: LikeRanking) => d.data.id === value,
                        );
                        return `{${value}| }\n{value|${data.data.name}}\n{ranking|${data.ranking}위}`;
                    },
                    rich: {
                        ...yAxisRichData,
                        value: {
                            width: 108,
                            align: 'center',
                            lineHeight: 20,
                        },
                        ranking: {
                            width: 100,
                            align: 'center',
                            lineHeight: 8,
                            fontWeight: 'bold',
                        },
                    },
                };
            }),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [likeRanking]);

    const handleSelectChange = (
        event: React.ChangeEvent<{ name?: string; value: unknown }>,
    ) => {
        const value: string = event.target.value as string;

        const option = {
            page: 1,
            focus,
        };

        switch (event.target.name) {
            case 'focus':
                setFocus(value);
                option.focus = value;
        }

        setPage(1);
        updatePage(option);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
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

    return (
        <Paper variant="outlined">
            <Grid container spacing={1}>
                <Grid item lg={2} md={2}>
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
            <EchartsCore
                echarts={echarts}
                option={option}
                showLoading={loading}
                style={{ height: '500px' }}
            />
            <Pagination
                onNext={nextPage}
                onPrev={prevPage}
                page={page}
                hasNextPage={likeRanking?.likeRanking?.pageInfo?.hasNextPage}
                hasPrevPage={likeRanking?.likeRanking?.pageInfo?.hasPrevPage}
            />
        </Paper>
    );
};

export default Stats;
