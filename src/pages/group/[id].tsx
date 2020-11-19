import React, { useEffect, useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

import EditorForm from '../../components/EditorForm';
import { GroupInterface } from 'Module';
import { useRouter } from 'next/router';

const GET_GROUP = gql`
    query getGroup($id: String!) {
        get(ids: [$id], focus: GROUP) {
            data {
                ... on Group {
                    name
                    tag
                    profileImage
                    description
                    type
                }
            }
        }
    }
`;

const SET_GROUP = gql`
    mutation setGroup($id: ID!, $data: InputData!) {
        update(id: $id, data: $data)
    }
`;

const UpdateGroup = (): JSX.Element => {
    const router = useRouter();

    const [data, setData] = useState<GroupInterface>({
        name: '',
        profileImage: '',
        tag: [],
        description: '',
        type: 'GROUP',
    });
    const [getGroup, { data: group, error }] = useLazyQuery(GET_GROUP, {
        fetchPolicy: 'no-cache',
    });
    const [setGroup] = useMutation(SET_GROUP);

    useEffect(() => {
        if (!router.query.id) {
            return;
        }

        getGroup({ variables: { id: router.query.id } });
    }, [router, getGroup]);

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
        await setGroup({
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
                type="group"
                title="그룹 변경"
                subtitle="그룹 변경"
                onClickSave={save}
            />
        </>
    );
};

export default UpdateGroup;
