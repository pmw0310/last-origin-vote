import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { CharacterInterface } from 'Module';

export interface CharacterItemProps {
    data: CharacterInterface;
}

const ItemCard = styled(Card)`
    display: flex;
    margin: 10px;
`;

const ItemCardMedia = styled(CardMedia)`
    width: 150px;
    height: 150px;
`;

const CharacterItem: React.FC<CharacterItemProps> = ({ data }): JSX.Element => {
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
        </ItemCard>
    );
};

export default CharacterItem;
