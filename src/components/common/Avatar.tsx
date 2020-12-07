import { Avatar, AvatarTypeMap } from '@material-ui/core';
import {
    BasicInterface,
    CharacterInterface,
    GroupInterface,
    SkinInterface,
    Type,
} from '../../module';
import { Order, Sort, listOption } from '../../state/list';
import styled, { css } from 'styled-components';

import Image from 'next/image';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import React from 'react';
import { toImage } from '../../lib/info';
import { useSetRecoilState } from 'recoil';

const defaultSize = 40;

interface AvatarTypeProps {
    size?: number;
    click?: boolean | string;
}

type AvatarType = OverridableComponent<AvatarTypeMap<AvatarTypeProps, 'div'>>;

const StyledAvatar = styled<AvatarType>(Avatar)`
    border: 0;
    ${({ size }) => {
        size = size || defaultSize;
        return css`
            width: ${size}px;
            height: ${size}px;
        `;
    }}
    ${({ click }) => {
        if (!click || click === 'false') {
            return;
        }
        return css`
            cursor: pointer;
        `;
    }}
`;

const StyledImage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

interface AvatarProps extends AvatarTypeProps {
    data?: CharacterInterface | GroupInterface | SkinInterface;
    alt: string;
    src: string;
    variant?: 'circle' | 'rounded' | 'square';
}

const AvatarElement: React.FC<AvatarProps> = ({
    data,
    alt,
    src,
    size,
    variant,
}): JSX.Element => {
    variant = variant || 'circle';

    const setListOption = useSetRecoilState(listOption);

    return (
        <StyledAvatar
            alt={alt}
            variant={variant}
            size={size}
            click={(!!data).toString()}
            className="MuiAvatarGroup-avatar"
            onClick={(event: React.MouseEvent<HTMLElement>): void => {
                if (!data) {
                    return;
                }

                event.stopPropagation();
                setListOption({
                    search: (data as BasicInterface).name as string,
                    page: 1,
                    order: Order.ASC,
                    focus: (data as BasicInterface).type as Type,
                    sort: Sort.name,
                });
            }}
        >
            {src && (
                <StyledImage>
                    <Image
                        alt={alt}
                        src={
                            (toImage(src) as string) ||
                            (toImage('/public/unknown.jpg') as string)
                        }
                        layout="fixed"
                        width={(size || defaultSize) - 4}
                        height={(size || defaultSize) - 4}
                        onError={(
                            e: React.SyntheticEvent<HTMLImageElement, Event>,
                        ) => {
                            const url =
                                'https://via.placeholder.com/50x50.png?text=Error';
                            e.currentTarget.decoding = 'sync';
                            e.currentTarget.src = url;
                            e.currentTarget.srcset = url;
                        }}
                    />
                </StyledImage>
            )}
        </StyledAvatar>
    );
};

export default AvatarElement;
