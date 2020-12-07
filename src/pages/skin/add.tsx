import React, { useState } from 'react';
import { SkinInterface, Type } from '../../module';
import { gql, useMutation } from '@apollo/client';

import EditorForm from '../../components/EditorForm';
import { useRouter } from 'next/router';

const ADD_GROUP = gql`
    mutation setSkin($data: InputData!) {
        add(data: $data)
    }
`;

const AddSkin = (): JSX.Element => {
    const [data, setData] = useState<SkinInterface>({
        name: '',
        tag: [],
        profileImage: '',
        description: '',
        type: Type.SKIN,
        skinCharId: '',
    });

    const [addSkin] = useMutation(ADD_GROUP);
    const router = useRouter();

    const save = async () => {
        await addSkin({
            variables: {
                data: { ...data, __typename: undefined },
            },
        });

        router.push('/');
    };

    return (
        <>
            <EditorForm
                data={data}
                setData={setData}
                type="skin"
                title="스킨 추가"
                subtitle="스킨 추가"
                onClickSave={save}
            />
        </>
    );
};

export default AddSkin;
