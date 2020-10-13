import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
// import styled from 'styled-components';
import { CharacterInterface } from 'Module';

export interface CharacterItemProps {
    data: CharacterInterface;
}

// const ItemCard = styled(Card)`
//     display: flex;
//     margin: 10px;
// `;

// const ItemCardMedia = styled(CardMedia)`
//     width: 150px;
//     height: 150px;
// `;

const CharacterEdit: React.FC<CharacterItemProps> = ({ data }): JSX.Element => {
    const [char, setChar] = useState<CharacterInterface>(data);

    const nameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChar({ ...char, name: event.target.value });
    };

    return (
        <>
            <TextField label="이름" value={char.name} onChange={nameChange} />
        </>
    );
};

export default CharacterEdit;
