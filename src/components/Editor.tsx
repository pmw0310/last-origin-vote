import React, { useState, useEffect } from 'react';
import {
    TextField,
    InputAdornment,
    Button,
    Typography,
    Grid,
    MenuItem,
    CircularProgress,
} from '@material-ui/core';
import styled from 'styled-components';
import { CharacterInterface, GroupInterface } from 'Module';
import ChipInput from 'material-ui-chip-input';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { EditorProps } from './EditorForm';

const IMAGEUPLOAD = gql`
    mutation imageUpload($file: Upload!) {
        imageUpload(upload: $file)
    }
`;

const GROUP_LIST = gql`
    query getGroup {
        get(limit: 99999, focus: GROUP) {
            data {
                ... on Group {
                    id
                    name
                }
            }
        }
    }
`;

const ItemTextField = styled(TextField)`
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
            <Grid item lg={4} md={6} sm={12}>
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
    const [imageUploading, setImageUploading] = useState<boolean>(false);
    const [singleUploadMutation] = useMutation(IMAGEUPLOAD);
    const [getGroup, { data: group }] = useLazyQuery(GROUP_LIST, {
        fetchPolicy: 'no-cache',
    });

    useEffect(() => {
        if (getGroup && !group) {
            getGroup();
        }
    }, [getGroup, group]);

    const handleChangeImage: React.ChangeEventHandler<HTMLInputElement> = async ({
        target: {
            files,
            validity: { valid },
        },
    }) => {
        const file = (files as FileList)[0];

        if (!file) {
            return;
        }

        if (valid) {
            setImageUploading(true);

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

            setImageUploading(false);
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
                <ItemTextField
                    label="이름"
                    value={data.name}
                    onChange={handleChange}
                    name="name"
                    variant="outlined"
                />
            </ItemGrid>
            {type === 'character' && (
                <>
                    <ItemGrid div={3}>
                        <ItemTextField
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
                    <ItemGrid div={3}>
                        <ItemTextField
                            label="클래스"
                            value={(data as CharacterInterface).class}
                            onChange={handleChange}
                            name="class"
                            variant="outlined"
                        />
                    </ItemGrid>
                    <ItemGrid div={3}>
                        <ItemTextField
                            label="무장"
                            value={(data as CharacterInterface).arm}
                            onChange={handleChange}
                            name="arm"
                            variant="outlined"
                        />
                    </ItemGrid>
                    <ItemGrid div={3}>
                        <ItemTextField
                            label="신장"
                            value={(data as CharacterInterface).stature}
                            onChange={handleChange}
                            name="stature"
                            type="number"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        cm
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                        />
                    </ItemGrid>
                    <ItemGrid div={3}>
                        <ItemTextField
                            label="체중"
                            value={(data as CharacterInterface).weight}
                            onChange={handleChange}
                            name="weight"
                            type="number"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        kg
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                        />
                    </ItemGrid>
                    <ItemGrid div={1}>
                        <HR />
                    </ItemGrid>
                    <ItemGrid div={2}>
                        <ItemTextField
                            label="등급"
                            select
                            value={(data as CharacterInterface).grade}
                            name="grade"
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value={'NONE'}>
                                <em>없음</em>
                            </MenuItem>
                            <MenuItem value={'B'}>B</MenuItem>
                            <MenuItem value={'A'}>A</MenuItem>
                            <MenuItem value={'S'}>S</MenuItem>
                            <MenuItem value={'SS'}>SS</MenuItem>
                        </ItemTextField>
                    </ItemGrid>
                    <ItemGrid div={2}>
                        <ItemTextField
                            label="최종 등급"
                            select
                            value={(data as CharacterInterface).lastGrade}
                            name="lastGrade"
                            onChange={handleChange}
                            variant="outlined"
                            helperText="승급이 있을 경우만 선택"
                        >
                            <MenuItem value={'NONE'}>
                                <em>없음</em>
                            </MenuItem>
                            <MenuItem value={'B'}>B</MenuItem>
                            <MenuItem value={'A'}>A</MenuItem>
                            <MenuItem value={'S'}>S</MenuItem>
                            <MenuItem value={'SS'}>SS</MenuItem>
                        </ItemTextField>
                    </ItemGrid>
                    <ItemGrid div={1}>
                        <HR />
                    </ItemGrid>
                    <ItemGrid div={2}>
                        <ItemTextField
                            label="타입"
                            select
                            value={(data as CharacterInterface).type}
                            name="type"
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value={'NONE'}>
                                <em>없음</em>
                            </MenuItem>
                            <MenuItem value={'LIGHT'}>경장형</MenuItem>
                            <MenuItem value={'FLYING'}>기동형</MenuItem>
                            <MenuItem value={'HEAVY'}>중장형</MenuItem>
                        </ItemTextField>
                    </ItemGrid>
                    <ItemGrid div={2}>
                        <ItemTextField
                            label="역할"
                            select
                            value={(data as CharacterInterface).role}
                            name="role"
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value={'NONE'}>
                                <em>없음</em>
                            </MenuItem>
                            <MenuItem value={'ASSAULT'}>공격기</MenuItem>
                            <MenuItem value={'SUPPORT'}>지원기</MenuItem>
                            <MenuItem value={'DEFENDER'}>보호기</MenuItem>
                        </ItemTextField>
                    </ItemGrid>
                    <ItemGrid div={1}>
                        <HR />
                    </ItemGrid>
                    {group && (
                        <ItemGrid div={1}>
                            <ItemTextField
                                label="그룹"
                                select
                                value={(data as CharacterInterface).groupId}
                                name="groupId"
                                onChange={handleChange}
                                variant="outlined"
                            >
                                <MenuItem value={''}>
                                    <em>없음</em>
                                </MenuItem>
                                {group &&
                                    group.get.data.map(
                                        (data: GroupInterface) => (
                                            <MenuItem
                                                value={data.id}
                                                key={data.id}
                                            >
                                                {data.name}
                                            </MenuItem>
                                        ),
                                    )}
                            </ItemTextField>
                        </ItemGrid>
                    )}
                </>
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
                <ItemTextField
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
                <HR />
            </ItemGrid>
            <ItemGrid div={1}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={
                            (data as CharacterInterface).profileImage ||
                            (data as GroupInterface).image ||
                            'https://via.placeholder.com/125x125.png?text=No+Image'
                        }
                        width="125"
                        height="125"
                    />
                    <Button
                        variant="contained"
                        component="label"
                        style={{ marginLeft: '30px' }}
                        disabled={imageUploading}
                    >
                        {imageUploading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Typography>이미지 업로드</Typography>
                        )}
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
