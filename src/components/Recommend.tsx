import {
    CharacterInterface,
    GroupInterface,
    LikeStats,
    SkinInterface,
} from '../module';
import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { likeAtom, likeDataType } from '../state/like';

import { AutoPlay } from '@egjs/flicking-plugins';
import CircularProgress from '@material-ui/core/CircularProgress';
import Flicking from '@egjs/react-flicking';
import RecommendItem from './RecommendItem';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

const FlickingRoot = styled(Flicking)`
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
`;

const LoadingRoot = styled.div`
    height: 150px;
    width: 100%;
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const RECOMMEND = gql`
    query recommend {
        recommend {
            ... on Character {
                id
                name
                type
                profileImage
                like
                createdAt
                likeStats {
                    like
                }
                like
            }
            ... on Group {
                id
                name
                type
                profileImage
                like
                createdAt
                likeStats {
                    like
                }
                like
            }
            ... on Skin {
                id
                name
                type
                profileImage
                like
                createdAt
                likeStats {
                    like
                }
                like
            }
        }
    }
`;

// interface RecommendProps {
//     data: Array<CharacterInterface | GroupInterface | SkinInterface>;
// }

const date = new Date();
date.setDate(date.getDate() - 12);
date.setHours(0, 0, 0, 0);

const plugins = [new AutoPlay({ duration: 5000 }, 'NEXT')];

const Recommend: React.FC = (): JSX.Element => {
    const { data, loading } = useQuery(RECOMMEND, {
        fetchPolicy: 'no-cache',
    });
    const [like, setLikeData] = useRecoilState(likeAtom);
    const [update, setUpdate] = useState<boolean>(false);

    let onMove: boolean = false;
    let onHold: boolean = false;

    useEffect(() => {
        if (!loading && data) {
            setUpdate(true);
        }
    }, [data, loading]);

    useEffect(() => {
        if (!update) {
            return;
        }

        const likeData: likeDataType = { ...like };

        for (const { id, like: state, likeStats } of data.recommend) {
            const { like } = likeStats as LikeStats;
            likeData[id as string] = { like, state: state === 1 };
        }
        setLikeData(likeData);
        setUpdate(false);
    }, [data, like, setLikeData, update]);

    const isPlaying = (): boolean => {
        return onMove || onHold;
    };

    if (loading) {
        return (
            <LoadingRoot>
                <CircularProgress />
            </LoadingRoot>
        );
    }

    return (
        <FlickingRoot
            circular={true}
            gap={16}
            autoResize={true}
            collectStatistics={false}
            plugins={plugins}
            zIndex={0}
            isEqualSize={true}
            isConstantSize={true}
            onMoveStart={() => {
                onMove = true;
            }}
            onMoveEnd={() => {
                onMove = false;
            }}
            onHoldStart={() => {
                onHold = true;
            }}
            onHoldEnd={() => {
                onHold = false;
            }}
        >
            {data.recommend.map(
                (
                    recommend:
                        | CharacterInterface
                        | GroupInterface
                        | SkinInterface,
                ) => (
                    <RecommendItem
                        data={recommend}
                        date={date}
                        isPlaying={isPlaying}
                        key={recommend.id}
                    />
                ),
            )}
        </FlickingRoot>
    );
};

export default React.memo(Recommend);
