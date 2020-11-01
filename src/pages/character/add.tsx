import React, { useState } from 'react';
import { useRouter } from 'next/router';
import EditorForm from '../../components/EditorForm';
import { CharacterInterface } from 'Module';
import { gql, useMutation } from '@apollo/client';

const ADD_CHARACTER = gql`
    mutation setCharacter($data: InputData!) {
        add(data: $data)
    }
`;

const AddCharacter = (): JSX.Element => {
    const [data, setData] = useState<CharacterInterface>({
        name: '',
        tag: [],
        profileImage: '',
        description: '',
        charNumber: 0,
        charGroupId: '',
        charGrade: 'NONE',
        charLastGrade: 'NONE',
        charType: 'NONE',
        charRole: 'NONE',
        charClass: '',
        charArm: '',
        charStature: 0,
        charWeight: 0,
        type: 'CHARACTER',
    });

    const [addCharacter] = useMutation(ADD_CHARACTER);
    const router = useRouter();

    const save = async () => {
        await addCharacter({
            variables: {
                data: {
                    ...data,
                    charNumber:
                        !data.charNumber && (data.charNumber as number) <= 0
                            ? 99999
                            : data.charNumber,
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
