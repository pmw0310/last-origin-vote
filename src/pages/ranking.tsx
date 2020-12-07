import 'echarts/lib/chart/bar';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';

import { CharacterInterface, GroupInterface } from '../module';
import { Grid, MenuItem, Paper, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import echarts, { EChartOption } from 'echarts/lib/echarts';
import { gql, useLazyQuery } from '@apollo/client';

import EchartsCore from 'echarts-for-react/lib/core';
import Pagination from '../components/common/Pagination';
import SearchInput from '../components/common/SearchInput';
import { TypeForm } from './index';
import produce from 'immer';
import { toNextImage } from '../lib/info';

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
                    ... on Skin {
                        id
                        name
                        profileImage
                    }
                }
                ranking
                like
            }
            pageInfo {
                totalPages
            }
        }
    }
`;

type LikeRanking = {
    data: CharacterInterface | GroupInterface;
    ranking: number;
};

const likeSvg = 'M5,2.4c2.1-5.9,10.1,0,0,7.6C-5.1,2.4,2.9-3.5,5,2.4z';

const Stats = (): JSX.Element => {
    const [page, setPage] = useState<number>(1);
    const [focus, setFocus] = useState<string>('CHARACTER');
    const [search, setSearch] = useState<string>('');
    const [max, setMax] = useState<{ [key: string]: number }>({});
    const [update, setUpdate] = useState<boolean>(false);

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
                    tooltip += `<svg height="10" width="10" style="margin-right:5px;"><path d="${likeSvg}" fill="${param.color}" /></svg>${param.seriesName}: ${param.value}<br>`;
                }
                return tooltip;
            },
        },
        grid: {
            top: 20,
            left: 105,
            right: 20,
            bottom: 20,
        },
        legend: {
            data: ['좋아요'],
            show: false,
            top: 15,
        },
        xAxis: {
            type: 'value',
            max: 10,
            show: false,
        },
        yAxis: {
            type: 'category',
            inverse: true,
            data: [],
        },
        series: [],
        color: ['#ee5162'],
        animationEasing: 'bounceOut',
        animationDelayUpdate: (idx: number) => idx * 3,
    });

    useEffect(() => {
        getLikeRanking({ variables: { page: 1, focus: 'CHARACTER' } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!loading && likeRanking) {
            setUpdate(true);
        }
    }, [likeRanking, loading]);

    useEffect(() => {
        if (!update) return;

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
                    image: (toNextImage(data.data.profileImage, 80) ||
                        toNextImage('/public/unknown.jpg', 80)) as string,
                },
            };
        }

        const seriesData: Array<{
            name: string;
            type: string;
            data: Array<number>;
            label: { show: boolean; position: string; fontSize: number };
            animationDelay: (index: number) => number;
        }> = [
            {
                name: '좋아요',
                type: 'bar',
                data: [],
                label: {
                    show: true,
                    position: 'insideRight',
                    fontSize: 16,
                },
                animationDelay: (idx) => idx * 50 + 250,
            },
        ];

        for (const { like } of ranking) {
            seriesData[0].data.push(like);
        }

        const _max = Math.max.apply(null, [
            ...seriesData[0].data,
            max[focus] ? max[focus] : 0,
        ]);
        setMax({ ...max, [focus]: _max });

        setOption(
            produce(option, (draft) => {
                (draft.xAxis as EChartOption.XAxis).max = _max;
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
                            width: 105,
                            align: 'center',
                            lineHeight: 20,
                        },
                        ranking: {
                            width: 105,
                            align: 'center',
                            lineHeight: 8,
                            fontWeight: 'bold',
                        },
                    },
                };
            }),
        );
        setUpdate(false);
    }, [focus, likeRanking, max, option, update]);

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
                            <MenuItem value={'SKIN'}>스킨</MenuItem>
                            <MenuItem value={'GROUP'}>부대</MenuItem>
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
            <EchartsCore
                echarts={echarts}
                option={option}
                showLoading={loading}
                opts={{ renderer: 'svg' }}
                style={{ height: '500px' }}
            />
            <Pagination
                count={likeRanking?.likeRanking?.pageInfo?.totalPages}
                page={page}
                disabled={loading}
                onUpdate={(_, page) => {
                    setPage(page);
                    updatePage({ page });
                }}
            />
        </Paper>
    );
};

export default Stats;
