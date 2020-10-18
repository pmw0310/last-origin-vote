import React, { useState } from 'react';
import Editor from '../../components/CharacterEditor';
import { GroupInterface } from 'Module';
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

export default function AdddCharacter(): JSX.Element {
    const [data, setData] = useState<GroupInterface>({
        name: '',
        tag: [],
    });

    const test = () => {
        console.log(data);
    };

    return (
        <AddPaper>
            <Space>
                <div>
                    <Typography variant="h5" gutterBottom>
                        그룹 추가
                    </Typography>
                    <Typography variant="caption" gutterBottom>
                        그룹 추가 합니다.
                    </Typography>
                </div>
                <Button variant="contained" color="primary" onClick={test}>
                    저장
                </Button>
            </Space>
            <Divider />
            <Space>
                <Editor data={data} setData={setData} type="group" />
            </Space>
        </AddPaper>
    );
}
