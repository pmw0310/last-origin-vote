import { CharacterInterface, GroupInterface } from 'Module';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { A11y, Autoplay, Navigation, Pagination } from 'swiper';
import { gql, useQuery } from '@apollo/client';
import { likeAtom, likeDataType } from '../components/common/LikeButton';

import LikeButton from '../components/common/LikeButton';
import { setInterval } from 'timers';
import styled from 'styled-components';
import { toProfileImage } from '../lib/info';
import { useRecoilState } from 'recoil';
import { webpVar } from '../lib/Webp';

SwiperCore.use([Navigation, Pagination, A11y, Autoplay]);

const SwiperRoot = styled(Swiper)`
    height: 183px;
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
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
        return <></>;
    }

    return (
        <div ref={ref}>
            <SwiperRoot
                spaceBetween={15}
                slidesPerView={Math.floor((width as number) / (150 + 15))}
                loop={true}
                navigation
                pagination={{ clickable: true }}
                // autoplay={{ delay: 15000, disableOnInteraction: false }}
                onSwiper={setSwiper}
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
                            />
                            <LikeButton id={recommend.id as string} />
                        </SwiperSlide>
                    ),
                )}
            </SwiperRoot>
        </div>
    );
};

export default Recommend;
