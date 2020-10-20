import React, { Dispatch } from 'react';
import Editor from './Editor';
import { CharacterInterface, GroupInterface } from 'Module';
import { Paper, Divider, Typography, Button } from '@material-ui/core';
import styled from 'styled-components';

const Space = styled.div`
    display: flex;
    padding: 38px;
    align-items: center;
    justify-content: space-between;
`;

const AddPaper = styled(Paper)`
    margin: 38px;
`;

export interface EditorProps {
    data: CharacterInterface | GroupInterface;
    setData: Dispatch<
        React.SetStateAction<CharacterInterface | GroupInterface>
    >;
    type: 'character' | 'group';
}

export interface EditorFormProps extends EditorProps {
    title: string;
    subtitle: string;
    onClickSave: () => Promise<void>;
}

const EditorForm: React.FC<EditorFormProps> = ({
    data,
    setData,
    type,
    title,
    subtitle,
    onClickSave,
}): JSX.Element => {
    return (
        <AddPaper>
            <Space>
                <div>
                    <Typography variant="h5" gutterBottom>
                        {title}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="textSecondary"
                        gutterBottom
                    >
                        {subtitle}
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onClickSave}
                >
                    저장
                </Button>
            </Space>
            <Divider />
            <Space>
                <Editor data={data} setData={setData} type={type} />
            </Space>
        </AddPaper>
    );
};

export default EditorForm;
