import React, { useState } from 'react';
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
import { EditorProps } from './EditorForm';

const IMAGEUPLOAD = gql`
    mutation imageUpload($file: Upload!) {
        imageUpload(upload: $file)
    }
`;

const ItemInputField = styled(TextField)`
    width: 100%;
`;

const HR = styled.hr`
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.12);
    border-bottom-width: 0;
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

const CharacterEdit: React.FC<EditorProps> = ({
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
                <HR />
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
                <HR />
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LazyLoadImage
                        src={
                            (data as CharacterInterface).profileImage ||
                            (data as GroupInterface).image ||
                            'https://via.placeholder.com/125x125.png?text=No+Image'
                        }
                        effect="opacity"
                        width="125"
                        height="125"
                    />
                    <Button
                        variant="contained"
                        component="label"
                        style={{ marginLeft: '30px' }}
                    >
                        <Typography>이미지 업로드</Typography>
                        <input
                            style={{ display: 'none' }}
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleChangeImage}
                        />
                    </Button>
                </div>
            </ItemGrid>
        </Grid>
    );
};

export default CharacterEdit;
