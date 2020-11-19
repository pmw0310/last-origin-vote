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

const LikeIconButton = styled(IconButton)`
    width: 62px;
    height: 62px;
    .MuiIconButton-label {
        display: flex;
        flex-direction: column;
    }
    .MuiTypography-root {
        line-height: 1;
        padding-top: 3px;
    }
`;

const Like = styled.div`
    position: absolute;
    bottom: 6px;
    right: 6px;
`;

const FavoriteIcon = styled(Favorite)`
    color: #ee5162;
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
}

const LikeButton: React.FC<LikeButtonProps> = ({ id }): JSX.Element => {
    const [like, setLike] = useRecoilState(likeAtom);
    const [
        mutationLike,
        { loading: mutationLoading, error: mutationError },
    ] = useMutation<{ setLike: LikeStats }>(SET_LIKE);
    const currentUser = currentUserVar();
    const dispatch = useSnackbarState();

    return (
        <Like>
            <LikeIconButton
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

                    const {
                        like: likeCount,
                        state,
                    } = data?.setLike as LikeStats;

                    setLike({ ...like, [id]: { like: likeCount, state } });
                }}
                onFocus={(event) => event.stopPropagation()}
            >
                {like[id] && like[id].state ? (
                    <FavoriteIcon />
                ) : (
                    <FavoriteBorderIcon />
                )}
                <Typography variant="button">
                    {like[id] ? like[id].like : 0}
                </Typography>
            </LikeIconButton>
        </Like>
    );
};

export default LikeButton;
