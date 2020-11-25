import React, { useEffect, useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

import EditorForm from '../../components/EditorForm';
import { SkinInterface } from 'Module';
import { useRouter } from 'next/router';

const GET_SKIN = gql`
    query getSkin($id: String!) {
        get(ids: [$id], focus: SKIN) {
            data {
                ... on Skin {
                    name
                    tag
                    profileImage
                    description
                    type
                    skinCharId
                }
            }
        }
    }
`;

const SET_SKIN = gql`
    mutation setSink($id: ID!, $data: InputData!) {
        update(id: $id, data: $data)
    }
`;

const UpdateSkin = (): JSX.Element => {
    const router = useRouter();

    const [data, setData] = useState<SkinInterface>({
        name: '',
        profileImage: '',
        tag: [],
        description: '',
        type: 'SKIN',
        skinCharId: '',
    });
    const [getSkin, { data: group, error }] = useLazyQuery(GET_SKIN, {
        fetchPolicy: 'no-cache',
    });
    const [setSkin] = useMutation(SET_SKIN);

    useEffect(() => {
        if (!router.query.id) {
            return;
        }

        getSkin({ variables: { id: router.query.id } });
    }, [router, getSkin]);

    useEffect(() => {
        if (error) {
            console.error(error.message);
            return;
        }
        if (!group) {
            return;
        }
        setData({ ...group.get.data[0] });
    }, [group, error]);

    const save = async () => {
        await setSkin({
            variables: {
                id: router.query.id,
                data: { ...data, __typename: undefined },
            },
        });

        router.push('/');
    };

    if (!group) {
        return <></>;
    }

    return (
        <>
            <EditorForm
                data={data}
                setData={setData}
                type="skin"
                title="스킨 변경"
                subtitle="스킨 변경"
                onClickSave={save}
            />
        </>
    );
};

export default UpdateSkin;
