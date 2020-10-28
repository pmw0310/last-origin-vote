import React, { useState } from 'react';
import { useRouter } from 'next/router';
import EditorForm from '../../components/EditorForm';
import { GroupInterface } from 'Module';
import { gql, useMutation } from '@apollo/client';

const ADD_GROUP = gql`
    mutation setGroup($data: GroupInput!) {
        addGroup(data: $data)
    }
`;

const AddGroup = (): JSX.Element => {
    const [data, setData] = useState<GroupInterface>({
        name: '',
        tag: [],
        image: '',
        description: '',
        __typename: 'Group',
    });

    const [addGroup] = useMutation(ADD_GROUP);
    const router = useRouter();

    const save = async () => {
        await addGroup({
            variables: {
                data: { ...data, __typename: undefined },
            },
        });

        router.push('/group');
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
