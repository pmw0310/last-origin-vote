import Pagination from '@material-ui/lab/Pagination';
import React from 'react';
import styled from 'styled-components';
import withWidth from '@material-ui/core/withWidth';

const PaginationRoot = styled.div`
    margin: 12px;
    display: flex;
    justify-content: center;
`;

interface PaginationProps {
    count: number;
    page: number;
    onUpdate: (event: React.ChangeEvent<unknown>, page: number) => void;
    width: string;
    disabled?: boolean;
}

const CharacterList: React.FC<PaginationProps> = ({
    count,
    page,
    onUpdate,
    width,
    disabled,
}): JSX.Element => {
    return (
        <PaginationRoot>
            <Pagination
                count={count}
                page={page}
                onChange={onUpdate}
                color="primary"
                siblingCount={width === 'xs' ? 1 : 3}
                boundaryCount={1}
                hideNextButton
                hidePrevButton
                disabled={disabled}
            />
        </PaginationRoot>
    );
};

export default withWidth()(CharacterList);
