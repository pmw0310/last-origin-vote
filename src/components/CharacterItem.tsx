import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
} from '@material-ui/core';
import styled from 'styled-components';
import { CharacterInterface } from 'Module';
import { Edit, Delete } from '@material-ui/icons';

export interface CharacterItemProps {
    data: CharacterInterface;
    auth?: boolean;
}

const ItemCard = styled(Card)`
    display: flex;
    margin: 10px;
`;

const ItemCardMedia = styled(CardMedia)`
    width: 150px;
    height: 150px;
`;

const CharacterItem: React.FC<CharacterItemProps> = ({
    data,
    auth,
}): JSX.Element => {
    return (
        <ItemCard>
            <ItemCardMedia
                image="https://via.placeholder.com/150x150.png?text=Test"
                title="test"
            />
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {data.name}
                </Typography>
            </CardContent>
            {auth && (
                <>
                    <IconButton>
                        <Edit />
                    </IconButton>
                    <IconButton>
                        <Delete />
                    </IconButton>
                </>
            )}
        </ItemCard>
    );
};

export default CharacterItem;
