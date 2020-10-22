import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EditorForm from '../../components/EditorForm';
import { CharacterInterface } from 'Module';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

const GET_CHARACTER = gql`
    query getCharacter($id: String!) {
        getCharacter(page: 1, ids: [$id]) {
            data {
                name
                tag
                profileImage
                description
                number
                groupId
                grade
                lastGrade
                type
                role
                class
                arm
                stature
                weight
            }
        }
    }
`;

const SET_CHARACTER = gql`
    mutation setCharacter($id: ID!, $data: CharacterInput!) {
        updateCharacter(id: $id, data: $data)
    }
`;

const UpdateCharacter = (): JSX.Element => {
    const router = useRouter();

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
    });
    const [getCharacter, { data: char, error }] = useLazyQuery(GET_CHARACTER, {
        fetchPolicy: 'no-cache',
    });
    const [setCharacter] = useMutation(SET_CHARACTER);

    useEffect(() => {
        if (!router.query.id) {
            return;
        }

        getCharacter({ variables: { id: router.query.id } });
    }, [router, getCharacter]);

    useEffect(() => {
        if (error) {
            console.error(error.message);
            return;
        }
        if (!char) {
            return;
        }
        const data: CharacterInterface = char.getCharacter.data[0];
        setData({ ...data, groupId: data.groupId ? data.groupId : '' });
    }, [char, error]);

    const save = async () => {
        await setCharacter({
            variables: {
                id: router.query.id,
                data: { ...data, __typename: undefined },
            },
        });

        router.push('/');
    };

    if (!char) {
        return <></>;
    }

    return (
        <>
            <EditorForm
                data={data}
                setData={setData}
                type="character"
                title="캐릭터 변경"
                subtitle="캐릭터 변경"
                onClickSave={save}
            />
        </>
    );
};

export default UpdateCharacter;
