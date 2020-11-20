import { CharacterInterface, GroupInterface } from 'Module';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { A11y, Autoplay, Lazy, Pagination } from 'swiper';
import { gql, useQuery } from '@apollo/client';
import { likeAtom, likeDataType } from '../components/common/LikeButton';

import CircularProgress from '@material-ui/core/CircularProgress';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import LikeButton from '../components/common/LikeButton';
import { setInterval } from 'timers';
import styled from 'styled-components';
import { toProfileImage } from '../lib/info';
import { useRecoilState } from 'recoil';
import { webpVar } from '../lib/Webp';

SwiperCore.use([Pagination, A11y, Autoplay, Lazy]);

const SwiperRoot = styled(Swiper)`
    height: 183px;
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
`;

const LoadingRoot = styled.div`
    height: 183px;
    width: 100%;
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Like = styled.div`
    position: absolute;
    bottom: 34px;
    right: 14px;
`;

const NewIcon = styled(FiberNewIcon)`
    position: absolute;
    top: 4px;
    left: 4px;
    color: red;
    width: 32px !important;
    height: 32px !important;
`;

const RECOMMEND = gql`
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
        }
    }
`;

const date = new Date();
date.setDate(date.getDate() - 12);
date.setHours(0, 0, 0, 0);

function useWidth(
    elementRef: React.RefObject<HTMLDivElement>,
): [number | null, () => void] {
    const [width, setWidth] = useState<number | null>(null);
    let interval: NodeJS.Timeout | undefined;

    const updateWidth = useCallback(() => {
        if (elementRef && elementRef?.current) {
            const { width } = elementRef?.current.getBoundingClientRect();
            setWidth(width);
        }
    }, [elementRef]);

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, [updateWidth]);

    interval = setInterval(() => {
        if (width === null) {
            updateWidth();
        } else {
            clearInterval(interval as NodeJS.Timeout);
            interval = undefined;
        }
    }, 10);

    return [width, updateWidth];
}

const Recommend = (): JSX.Element => {
    const { data, loading } = useQuery(RECOMMEND, {
        fetchPolicy: 'no-cache',
    });
    const ref = useRef<HTMLDivElement>(null);
    const [swiper, setSwiper] = useState<SwiperCore | null>(null);
    const [width] = useWidth(ref);
    const [like, setLikeData] = useRecoilState(likeAtom);
    const [update, setUpdate] = useState<boolean>(false);
    const webp = webpVar();

    useEffect(() => {
        if (!loading && data) {
            setUpdate(true);
        }
    }, [data, loading]);

    useEffect(() => {
        if (!update) {
            return;
        }

        const { recommend } = data;
        const likeData: likeDataType = { ...like };

        for (const {
            id,
            like: state,
            likeStats: { like },
        } of recommend) {
            likeData[id] = { like, state: state === 1 };
        }
        setLikeData(likeData);
        setUpdate(false);
    }, [data, like, loading, setLikeData, update]);

    useEffect(() => {
        if (width && swiper) {
            swiper.slideToLoop(0, 0);
        }
    }, [width, swiper]);

    if (loading) {
        return (
            <LoadingRoot>
                <CircularProgress />
            </LoadingRoot>
        );
    }

    return (
        <div ref={ref}>
            <SwiperRoot
                spaceBetween={15}
                slidesPerView={Math.floor((width as number) / (150 + 15))}
                loop={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 15000, disableOnInteraction: false }}
                onSwiper={setSwiper}
                lazy={true}
            >
                {data.recommend.map(
                    (recommend: CharacterInterface | GroupInterface) => (
                        <SwiperSlide key={recommend.id}>
                            <img
                                src={
                                    toProfileImage(
                                        recommend.profileImage,
                                        webp,
                                    ) ||
                                    'https://via.placeholder.com/150x150.png?text=No+Image'
                                }
                                onError={(
                                    e: React.SyntheticEvent<
                                        HTMLImageElement,
                                        Event
                                    >,
                                ) => {
                                    e.currentTarget.src =
                                        'https://via.placeholder.com/150x150.png?text=Error';
                                }}
                                width="150"
                                height="150"
                                className="swiper-lazy"
                            />
                            {(recommend?.createdAt as number) >
                                date.getTime() && <NewIcon />}

                            <Like>
                                <LikeButton
                                    id={recommend.id as string}
                                    showCount={false}
                                />
                            </Like>
                        </SwiperSlide>
                    ),
                )}
            </SwiperRoot>
        </div>
    );
};

export default Recommend;
