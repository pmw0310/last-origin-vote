import {
    Favorite,
    FavoriteBorder as FavoriteBorderIcon,
} from '@material-ui/icons';
import { FeedbackType, useSnackbarState } from '../../components/Feedback';
import { IconButton, Typography } from '@material-ui/core';
import { atom, useRecoilState } from 'recoil';
import { gql, useMutation } from '@apollo/client';

import { LikeStats } from 'Module';
import React from 'react';
import { currentUserVar } from '../../lib/apollo';
import styled from 'styled-components';

export type likeDataType = { [id: string]: LikeStats };

export const likeAtom = atom<likeDataType>({
    key: 'like',
    default: {},
});

const FavoriteIcon = styled(Favorite)`
    color: #ee5162;
`;

const Icon = styled.div`
    width: 24px;
    height: 24px;
`;

const IconBack = styled(Favorite)`
    color: white;
    position: absolute;
    left: 8px;
    top: 8px;
`;

const BorderIcon = styled(FavoriteBorderIcon)`
    position: absolute;
    left: 8px;
    top: 8px;
`;

const SET_LIKE = gql`
    mutation setLike($target: ID!) {
        setLike(target: $target) {
            like
            state
        }
    }
`;

interface LikeButtonProps {
    id: string;
    showCount: boolean;
}

export const LikeIconButton = styled(IconButton)`
    &.like-button-show-count {
        width: 62px;
        height: 62px;
    }
    &.like-button-no-show-count {
        width: 16px;
        height: 16px;
    }
    &.like-button-show-count .MuiIconButton-label {
        display: flex;
        flex-direction: column;
    }
    &.like-button-show-count .MuiTypography-root {
        line-height: 1;
        padding-top: 3px;
    }
`;

const LikeButton: React.FC<LikeButtonProps> = ({
    id,
    showCount,
}): JSX.Element => {
    const [like, setLike] = useRecoilState(likeAtom);
    const [
        mutationLike,
        { loading: mutationLoading, error: mutationError },
    ] = useMutation<{ setLike: LikeStats }>(SET_LIKE);
    const currentUser = currentUserVar();
    const dispatch = useSnackbarState();

    return (
        <LikeIconButton
            className={
                showCount
                    ? 'like-button-show-count'
                    : 'like-button-no-show-count'
            }
            disableFocusRipple={true}
            disableTouchRipple={true}
            disableRipple={true}
            onClick={async (event) => {
                event.stopPropagation();

                if (!currentUser) {
                    dispatch({
                        type: FeedbackType.OPEN,
                        option: {
                            measage: '로그인이 필요합니다.',
                            severity: 'warning',
                        },
                    });
                    return;
                } else if (mutationLoading) {
                    return;
                }

                const { data } = await mutationLike({
                    variables: { target: id },
                });

                if (mutationError) {
                    dispatch({
                        type: FeedbackType.OPEN,
                        option: {
                            measage: '작업이 실패하였습니다.',
                            severity: 'error',
                        },
                    });
                    return;
                }

                const { like: likeCount, state } = data?.setLike as LikeStats;

                setLike({ ...like, [id]: { like: likeCount, state } });
            }}
            onFocus={(event) => event.stopPropagation()}
        >
            {like[id] && like[id].state ? (
                <FavoriteIcon className="like-icon" />
            ) : showCount ? (
                <FavoriteBorderIcon />
            ) : (
                <Icon className="like-icon">
                    <IconBack />
                    <BorderIcon />
                </Icon>
            )}
            {showCount && (
                <Typography variant="button">
                    {like[id] ? like[id].like : 0}
                </Typography>
            )}
        </LikeIconButton>
    );
};

export default LikeButton;