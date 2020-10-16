import React, { useState, Dispatch } from 'react';
import {
    TextField,
    InputAdornment,
    Button,
    Typography,
    Grid,
} from '@material-ui/core';
import styled from 'styled-components';
import { CharacterInterface, GroupInterface } from 'Module';
import ChipInput from 'material-ui-chip-input';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/react-hooks';
import { LazyLoadImage } from 'react-lazy-load-image-component';

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

const ItemInputField = styled(TextField)`
    width: 100%;
`;

const ItemGrid: React.FC<{
    div: 1 | 2 | 3;
    children: React.ReactNode;
}> = ({ div, children }): JSX.Element => {
    if (div === 1) {
        return (
            <Grid item xs={12}>
                {children}
            </Grid>
        );
    } else if (div === 2) {
        return (
            <Grid item lg={6} md={12}>
                {children}
            </Grid>
        );
    } else {
        return (
            <Grid item lg={3} md={6} sm={12}>
                {children}
            </Grid>
        );
    }
};

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
        <Grid container spacing={2}>
            <ItemGrid div={3}>
                <ItemInputField
                    label="이름"
                    value={data.name}
                    onChange={handleChange}
                    name="name"
                    variant="outlined"
                />
            </ItemGrid>

            {type === 'character' && (
                <ItemGrid div={3}>
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
                        variant="outlined"
                    />
                </ItemGrid>
            )}
            <ItemGrid div={1}>
                <hr />
            </ItemGrid>
            <ItemGrid div={1}>
                <ChipInput
                    label="태그"
                    value={data.tag}
                    onAdd={(chip) => handleTagAdd(chip, Date.now())}
                    onDelete={(chip, index) => handleTagDelete(chip, index)}
                    variant="outlined"
                />
            </ItemGrid>
            <ItemGrid div={1}>
                <hr />
            </ItemGrid>
            <ItemGrid div={1}>
                <ItemInputField
                    label="설명"
                    multiline
                    rowsMax={4}
                    value={data.description}
                    onChange={handleChange}
                    name="description"
                    variant="outlined"
                />
            </ItemGrid>
            <ItemGrid div={1}>
                <LazyLoadImage
                    src={
                        (data as CharacterInterface).profileImage ||
                        (data as GroupInterface).image ||
                        'https://via.placeholder.com/150x150.png?text=No+Image'
                    }
                    effect="opacity"
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
            </ItemGrid>
        </Grid>
    );
};

export default CharacterEdit;
