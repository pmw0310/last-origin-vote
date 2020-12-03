import { CharacterInterface, GroupInterface, LikeStats } from 'Module';
import React, { useEffect } from 'react';
import { likeAtom, likeDataType } from '../components/common/LikeButton';

import { AutoPlay } from '@egjs/flicking-plugins';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import Flicking from '@egjs/react-flicking';
import Image from 'next/image';
import LikeButton from '../components/common/LikeButton';
import { gql } from '@apollo/client';
import styled from 'styled-components';
import { toImage } from '../lib/info';
import { useRecoilState } from 'recoil';

const FlickingRoot = styled(Flicking)`
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
`;

const Like = styled.div`
    position: absolute;
    bottom: 1px;
    right: 1px;
`;

const NewIcon = styled(FiberNewIcon)`
    position: absolute;
    top: 4px;
    left: 4px;
    color: red;
    width: 32px !important;
    height: 32px !important;
`;

const RecommendItem = styled.div`
    width: 150px;
    height: 150px;
`;

export const RECOMMEND = gql`
    query recommend {
        recommend {
            ... on Character {
                id
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

interface RecommendProps {
    data: Array<CharacterInterface>;
}

const date = new Date();
date.setDate(date.getDate() - 12);
date.setHours(0, 0, 0, 0);

const plugins = [new AutoPlay({ duration: 5000 }, 'NEXT')];

const Recommend: React.FC<RecommendProps> = ({ data }): JSX.Element => {
    const [like, setLikeData] = useRecoilState(likeAtom);

    useEffect(() => {
        const likeData: likeDataType = { ...like };

        for (const { id, like: state, likeStats } of data) {
            const { like } = likeStats as LikeStats;
            likeData[id as string] = { like, state: state === 1 };
        }
        setLikeData(likeData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <FlickingRoot
            circular={true}
            gap={12}
            autoResize={true}
            collectStatistics={false}
            plugins={plugins}
            zIndex={0}
            isEqualSize={true}
            isConstantSize={true}
        >
            {data.map((recommend: CharacterInterface | GroupInterface) => (
                <RecommendItem key={recommend.id}>
                    <Image
                        alt="image"
                        src={
                            (toImage(recommend.profileImage) as string) ||
                            (toImage('/public/unknown.jpg') as string)
                        }
                        layout="fill"
                        loading="eager"
                        onError={(
                            e: React.SyntheticEvent<HTMLImageElement, Event>,
                        ) => {
                            const url =
                                'https://via.placeholder.com/150x150.png?text=Error';
                            e.currentTarget.decoding = 'sync';
                            e.currentTarget.src = url;
                            e.currentTarget.srcset = url;
                        }}
                    />
                    {(recommend?.createdAt as number) > date.getTime() && (
                        <NewIcon />
                    )}
                    <Like>
                        <LikeButton
                            id={recommend.id as string}
                            showCount={false}
                        />
                    </Like>
                </RecommendItem>
            ))}
        </FlickingRoot>
    );
};

export default React.memo(Recommend);
