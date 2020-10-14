import React, { useState, Dispatch } from 'react';
import { TextField } from '@material-ui/core';
// import styled from 'styled-components';
import { CharacterInterface } from 'Module';
import ChipInput from 'material-ui-chip-input';

export interface CharacterItemProps {
    data: CharacterInterface;
    setData: Dispatch<React.SetStateAction<CharacterInterface>>;
}

// const ItemCard = styled(Card)`
//     display: flex;
//     margin: 10px;
// `;

// const ItemCardMedia = styled(CardMedia)`
//     width: 150px;
//     height: 150px;
// `;

const CharacterEdit: React.FC<CharacterItemProps> = ({
    data,
    setData,
}): JSX.Element => {
    const [last, setLast] = useState<number>(0);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };

    const handleTagAdd = (addTag: string, time: number) => {
        // 유니코드에서 onKeyDown 이벤트가 2번입력되는 현상을 막기위한 코드
        if (last === 0 || time - last > 250) {
            const tag = data?.tag?.concat(addTag);
            setData({ ...data, tag });
        }

        setLast(time);
    };

    const handleTagDelete = (_chip: string, deleteIndex: number) => {
        const tag = data?.tag?.filter((_tag, index) => index !== deleteIndex);
        setData({ ...data, tag });
    };

    return (
        <>
            <TextField
                label="이름"
                value={data.name}
                onChange={handleChange}
                name="name"
            />
            <ChipInput
                label="태그"
                // onUpdateInput={onTest}
                value={data.tag}
                onAdd={(chip) => handleTagAdd(chip, Date.now())}
                onDelete={(chip, index) => handleTagDelete(chip, index)}
            />
        </>
    );
};

export default CharacterEdit;
