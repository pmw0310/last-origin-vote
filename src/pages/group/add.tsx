import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

import EditorForm from '../../components/EditorForm';
import { GroupInterface } from 'Module';
import { useRouter } from 'next/router';

const ADD_GROUP = gql`
    mutation setGroup($data: InputData!) {
        add(data: $data)
    }
`;

const AddGroup = (): JSX.Element => {
    const [data, setData] = useState<GroupInterface>({
        name: '',
        tag: [],
        profileImage: '',
        description: '',
        type: 'GROUP',
    });

    const [addGroup] = useMutation(ADD_GROUP);
    const router = useRouter();

    const save = async () => {
        await addGroup({
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
                type="group"
                title="그룹 추가"
                subtitle="그룹 추가"
                onClickSave={save}
            />
        </>
    );
};

export default AddGroup;
