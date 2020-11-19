import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
} from '@material-ui/icons';
import { Button, Typography } from '@material-ui/core';

import React from 'react';
import styled from 'styled-components';

const Page = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    .MuiTypography-root {
        font-size: 1.05rem !important;
        padding: 0 24px;
    }
`;

const PageButton = styled(Button)`
    padding: 6px !important;
    border-radius: 18px !important;
    min-width: 0 !important;
    .MuiButton-startIcon {
        margin: 0 !important;
    }
`;

interface PaginationProps {
    onNext: () => void;
    onPrev: () => void;
    page: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
}

const CharacterList: React.FC<PaginationProps> = ({
    page,
    onNext,
    onPrev,
    hasPrevPage,
    hasNextPage,
}): JSX.Element => {
    return (
        <Page>
            <PageButton
                onClick={onPrev}
                variant="contained"
                size={'small'}
                color="primary"
                startIcon={<ArrowBackIcon />}
                disabled={!hasPrevPage}
            />
            <Typography variant="h6">{`Page ${page}`}</Typography>
            <PageButton
                onClick={onNext}
                variant="contained"
                size={'small'}
                color="primary"
                startIcon={<ArrowForwardIcon />}
                disabled={!hasNextPage}
            />
        </Page>
    );
};

export default CharacterList;
