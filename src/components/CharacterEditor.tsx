import React, { useState, Dispatch } from 'react';
import {
    TextField,
    InputAdornment,
    Button,
    Typography,
} from '@material-ui/core';
// import styled from 'styled-components';
import { CharacterInterface, GroupInterface } from 'Module';
import ChipInput from 'material-ui-chip-input';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/react-hooks';

export interface Props {
    data: CharacterInterface | GroupInterface;
    setData: Dispatch<
        React.SetStateAction<CharacterInterface | GroupInterface>
    >;
    type: 'character' | 'group';
}

const IMAGEUPLOAD = gql`
    mutation imageUpload($file: Upload!) {
        imageUpload(upload: $file)
    }
`;

// const ItemCard = styled(Card)`
//     display: flex;
//     margin: 10px;
// `;

// const ItemCardMedia = styled(CardMedia)`
//     width: 150px;
//     height: 150px;
// `;

const CharacterEdit: React.FC<Props> = ({
    data,
    setData,
    type,
}): JSX.Element => {
    const [last, setLast] = useState<number>(0);

    const [singleUploadMutation] = useMutation(IMAGEUPLOAD);

    const handleChangeImage: React.ChangeEventHandler<HTMLInputElement> = async ({
        target: {
            files,
            validity: { valid },
        },
    }) => {
        const file = (files as FileList)[0];

        if (valid) {
            try {
                const {
                    data: { imageUpload: url },
                } = await singleUploadMutation({
                    variables: {
                        file,
                    },
                });

                setData({
                    ...data,
                    [type === 'character' ? 'profileImage' : 'image']: url,
                });
            } catch (e) {
                setData({
                    ...data,
                    [type === 'character' ? 'profileImage' : 'image']: null,
                });
            }
        }
    };

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
            {type === 'character' && (
                <TextField
                    label="번호"
                    value={(data as CharacterInterface).number}
                    onChange={handleChange}
                    name="number"
                    type="number"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                no.
                            </InputAdornment>
                        ),
                    }}
                />
            )}
            <ChipInput
                label="태그"
                value={data.tag}
                onAdd={(chip) => handleTagAdd(chip, Date.now())}
                onDelete={(chip, index) => handleTagDelete(chip, index)}
            />
            <TextField
                label="설명"
                multiline
                rowsMax={4}
                value={data.description}
                onChange={handleChange}
                name="description"
            />
            <img
                src={
                    (data as CharacterInterface).profileImage ||
                    (data as GroupInterface).image ||
                    'https://via.placeholder.com/150x150.png?text=NoImage'
                }
                width="150"
                height="150"
            />
            <Button variant="contained" component="label">
                <Typography>{'변경'}</Typography>

                <input
                    style={{ display: 'none' }}
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handleChangeImage}
                />
            </Button>
        </>
    );
};

export default CharacterEdit;
