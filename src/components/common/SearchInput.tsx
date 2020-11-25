import { Close as CloseIcon, Search as SearchIcon } from '@material-ui/icons';
import { IconButton, InputBase, Paper } from '@material-ui/core';
import React, { useState } from 'react';

import styled from 'styled-components';

export const SearchRoot = styled(Paper)`
    margin: 12px;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    width: 100%;
`;

export const SearchIconButton = styled(IconButton)`
    padding: 10;
`;

export const SearchInputBase = styled(InputBase)`
    flex: 1;
    margin-left: 8px;
`;

export interface SearchInputProps {
    onChange: (search: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onChange }) => {
    const [search, setSearch] = useState<string>('');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleSearchKeyPress = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onChange(search);
        }
    };

    const handleSearchButton = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        onChange(search);
    };

    const handleSearchClearButton = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        if (search) {
            setSearch('');
            onChange('');
        }
    };

    return (
        <SearchRoot component="form">
            <SearchIconButton aria-label="search" onClick={handleSearchButton}>
                <SearchIcon />
            </SearchIconButton>
            <SearchInputBase
                placeholder="검색..."
                inputProps={{ 'aria-label': 'search' }}
                value={search}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
            />
            {search && (
                <SearchIconButton
                    aria-label="clear"
                    onClick={handleSearchClearButton}
                >
                    <CloseIcon />
                </SearchIconButton>
            )}
        </SearchRoot>
    );
};

export default SearchInput;
