import { FeedbackStateType, snackbarAtom } from '../../components/Feedback';
import { IconButton, Typography } from '@material-ui/core';
import { atom, useRecoilState, useSetRecoilState } from 'recoil';
import { gql, useMutation } from '@apollo/client';

import { Favorite } from '@material-ui/icons';
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

const FavoriteBorderIcon = styled(Favorite)`
    color: white;
    stroke: rgba(0, 0, 0, 0.54);
    stroke-width: 2;
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
    /* &.like-button-no-show-count {
        width: 16px;
        height: 16px;
    } */
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
    const setSnackbar = useSetRecoilState(snackbarAtom);

    return (
        <LikeIconButton
            className={
                showCount
                    ? 'like-button-show-count'
                    : 'like-button-no-show-count'
            }
            onClick={async (event) => {
                event.stopPropagation();

                if (!currentUser) {
                    setSnackbar({
                        state: FeedbackStateType.OPEN,
                        measage: '로그인이 필요합니다.',
                        severity: 'warning',
                    });
                    return;
                } else if (mutationLoading) {
                    return;
                }

                const { data } = await mutationLike({
                    variables: { target: id },
                });

                if (mutationError) {
                    setSnackbar({
                        state: FeedbackStateType.OPEN,
                        measage: '작업이 실패하였습니다.',
                        severity: 'error',
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
            ) : (
                <FavoriteBorderIcon />
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
