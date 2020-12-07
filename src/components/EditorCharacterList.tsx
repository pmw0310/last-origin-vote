import React, { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

import Button from '@material-ui/core/Button';
import { CharacterInterface } from '../module';
import Pagination from './common/Pagination';
import SearchInput from './common/SearchInput';
import styled from 'styled-components';

const GET_CHARACTER = gql`
    query get($page: Int!, $search: String!) {
        get(focus: CHARACTER, page: $page, limit: 10, search: $search) {
            data {
                ... on Character {
                    id
                    name
                }
            }
            pageInfo {
                totalPages
            }
        }
    }
`;

const ItemRoot = styled.div``;

export interface EditorCharacterListProps {
    defaultId?: string;
    onChange: (id: string) => void;
}

const EditorCharacterList: React.FC<EditorCharacterListProps> = ({
    defaultId,
    onChange,
}) => {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [charId, setCharId] = useState<string>((defaultId as string) && '');
    const [get, { data, loading }] = useLazyQuery(GET_CHARACTER, {
        fetchPolicy: 'no-cache',
    });

    useEffect(() => {
        if (get && !data) {
            get({
                variables: {
                    page,
                    search,
                },
            });
        }
    }, [get, data, page, search]);

    const updatePage = (option?: { page?: number; search?: string }): void => {
        get({
            variables: {
                page,
                search,
                ...option,
            },
        });
    };

    return (
        <>
            <SearchInput
                onChange={(search: string) => {
                    setPage(1);
                    setSearch(search);
                    updatePage({ page: 1, search });
                }}
            />
            <ItemRoot>
                {!loading &&
                    data &&
                    data.get.data.map((char: CharacterInterface) => (
                        <Button
                            key={char.id}
                            variant={
                                char.id === charId ? 'contained' : undefined
                            }
                            color={char.id === charId ? 'primary' : 'secondary'}
                            onClick={() => {
                                setCharId(char.id as string);
                                onChange(char.id as string);
                            }}
                        >
                            {char.name}
                        </Button>
                    ))}
            </ItemRoot>
            <Pagination
                count={data?.get?.pageInfo?.totalPages}
                page={page}
                disabled={loading}
                onUpdate={(_, page) => {
                    setPage(page);
                    updatePage({ page });
                }}
            />
        </>
    );
};

export default EditorCharacterList;
