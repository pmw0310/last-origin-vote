import React, { useState } from 'react';
import { useRouter } from 'next/router';
import EditorForm from '../../components/EditorForm';
import { CharacterInterface } from 'Module';
import { gql, useMutation } from '@apollo/client';

const ADD_CHARACTER = gql`
    mutation setCharacter($data: CharacterInput!) {
        addCharacter(data: $data)
    }
`;

const AddCharacter = (): JSX.Element => {
    const [data, setData] = useState<CharacterInterface>({
        name: '',
        tag: [],
        profileImage: '',
        description: '',
        number: 0,
        groupId: '',
        grade: 'NONE',
        lastGrade: 'NONE',
        type: 'NONE',
        role: 'NONE',
        class: '',
        arm: '',
        stature: 0,
        weight: 0,
        __typename: 'Character',
    });

    const [addCharacter] = useMutation(ADD_CHARACTER);
    const router = useRouter();

    const save = async () => {
        await addCharacter({
            variables: {
                data: {
                    ...data,
                    number:
                        !data.number && (data.number as number) <= 0
                            ? undefined
                            : data.number,
                    basicType: 'CHARACTER',
                    __typename: undefined,
                },
            },
        });

        router.push('/');
    };

    return (
        <>
            <EditorForm
                data={data}
                setData={setData}
                type="character"
                title="캐릭터 추가"
                subtitle="캐릭터 추가"
                onClickSave={save}
            />
        </>
    );
};

export default AddCharacter;
