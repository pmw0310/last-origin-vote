import {
    CharacterInterface,
    GroupInterface,
    SkinInterface,
    Type,
} from '../module';
import { Order, Sort, listOption } from '../state/list';

import LikeButton from '../components/common/LikeButton';
import React from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { toImage } from '../lib/info';
import { useSetRecoilState } from 'recoil';

const Image = dynamic(() => import('next/image'), {
    ssr: false,
});

const Like = styled.div`
    position: absolute;
    bottom: 1px;
    right: 1px;
`;

const New = styled.div`
    position: absolute;
    left: 1px;
    top: 1px;
    background: -moz-linear-gradient(
        left,
        rgba(225, 179, 243, 1) 0%,
        rgba(223, 44, 198, 1) 8%,
        rgba(223, 44, 198, 1) 15%,
        rgba(223, 44, 198, 0) 100%
    );
    background: linear-gradient(
        to right,
        rgba(225, 179, 243, 1) 0%,
        rgba(223, 44, 198, 1) 8%,
        rgba(223, 44, 198, 1) 15%,
        rgba(223, 44, 198, 0) 100%
    );
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e1b3f3', endColorstr='#00df2cc6',GradientType=1 );
    width: 100px !important;
    height: 28px !important;
    padding-left: 12px;
    line-height: 28px;
    color: white;
    text-shadow: -2px 0 rgba(0, 0, 0, 0.54), 0 2px rgba(0, 0, 0, 0.54),
        2px 0 rgba(0, 0, 0, 0.54), 0 -2px rgba(0, 0, 0, 0.54);
    font-weight: bolder;
    border-radius: 1px;
`;
const NewOutline = styled.div`
    position: absolute;
    background: -moz-linear-gradient(
        left,
        rgba(40, 29, 69, 0.75) 0%,
        rgba(40, 29, 69, 0) 100%
    );
    background: linear-gradient(
        to right,
        rgba(40, 29, 69, 0.75) 0%,
        rgba(40, 29, 69, 0) 100%
    );
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#281d45', endColorstr='#00281d45',GradientType=1 );
    width: 101px !important;
    height: 30px !important;
    border-radius: 2px;
`;

const Item = styled.div`
    width: 150px;
    height: 150px;
    cursor: pointer;
`;

interface RecommendItemProps {
    data: CharacterInterface | GroupInterface | SkinInterface;
    date: Date;
    isPlaying: () => boolean;
}

const RecommendItem: React.FC<RecommendItemProps> = ({
    data,
    date,
    isPlaying,
}): JSX.Element => {
    const setListOption = useSetRecoilState(listOption);

    return (
        <Item
            onClick={(event: React.MouseEvent<HTMLElement>): void => {
                if (isPlaying()) {
                    return;
                }

                event.stopPropagation();
                setListOption({
                    search: data.name as string,
                    page: 1,
                    order: Order.ASC,
                    focus: data.type as Type,
                    sort: Sort.name,
                });
            }}
        >
            <Image
                alt="image"
                src={
                    (toImage(data.profileImage) as string) ||
                    (toImage('/public/unknown.jpg') as string)
                }
                layout="fill"
                loading="eager"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const url =
                        'https://via.placeholder.com/150x150.png?text=Error';
                    e.currentTarget.decoding = 'sync';
                    e.currentTarget.src = url;
                    e.currentTarget.srcset = url;
                }}
            />
            {(data?.createdAt as number) > date.getTime() && (
                <>
                    <NewOutline />
                    <New>New</New>
                </>
            )}
            <Like>
                <LikeButton id={data.id as string} showCount={false} />
            </Like>
        </Item>
    );
};

export default React.memo(RecommendItem);
