import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EditorForm from '../../components/EditorForm';
import { CharacterInterface } from 'Module';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

const GET_CHARACTER = gql`
    query getCharacter($id: String!) {
        get(ids: [$id], focus: CHARACTER) {
            data {
                ... on Character {
                    name
                    tag
                    profileImage
                    description
                    charNumber
                    charGroupId
                    charGrade
                    charLastGrade
                    charType
                    charRole
                    charClass
                    charArm
                    charStature
                    charWeight
                    charIsAgs
                    type
                }
            }
        }
    }
`;

const SET_CHARACTER = gql`
    mutation setCharacter($id: ID!, $data: InputData!) {
        update(id: $id, data: $data)
    }
`;

const UpdateCharacter = (): JSX.Element => {
    const router = useRouter();

    const [data, setData] = useState<CharacterInterface>({
        name: '',
        tag: [],
        profileImage: '',
        description: '',
        charNumber: 0,
        charGroupId: '',
        charGrade: 0,
        charLastGrade: 0,
        charType: 0,
        charRole: 0,
        charClass: '',
        charArm: '',
        charStature: 0,
        charWeight: 0,
        charIsAgs: false,
        type: 'CHARACTER',
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
        const data: CharacterInterface = char.get.data[0];
        if (!data.charGrade) data.charGrade = 0;
        if (!data.charLastGrade) data.charLastGrade = 0;
        if (!data.charType) data.charType = 0;
        if (!data.charRole) data.charRole = 0;

        setData({
            ...data,
            charGroupId: data.charGroupId ? data.charGroupId : '',
        });
    }, [char, error]);

    const save = async () => {
        await setCharacter({
            variables: {
                id: router.query.id,
                data: {
                    ...data,
                    charNumber:
                        !data.charNumber && (data.charNumber as number) <= 0
                            ? 99999
                            : data.charNumber,
                    charGrade:
                        data.charGrade === 0 ? undefined : data.charGrade,
                    charLastGrade:
                        data.charLastGrade === 0
                            ? undefined
                            : data.charLastGrade,
                    charType: data.charType === 0 ? undefined : data.charType,
                    charRole: data.charRole === 0 ? undefined : data.charRole,
                    __typename: undefined,
                },
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
