import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EditorForm from '../../components/EditorForm';
import { GroupInterface } from 'Module';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

const GET_GROUP = gql`
    query getGroup($id: String!) {
        getGroup(page: 1, ids: [$id]) {
            data {
                name
                tag
                image
                description
            }
        }
    }
`;

const SET_GROUP = gql`
    mutation setGroup($id: ID!, $data: GroupInput!) {
        updateGroup(id: $id, data: $data)
    }
`;

const UpdateGroup = (): JSX.Element => {
    const router = useRouter();

    const [data, setData] = useState<GroupInterface>({
        name: '',
        image: '',
        tag: [],
        description: '',
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
        setData({ ...group.getGroup.data[0] });
    }, [group, error]);

    const save = async () => {
        await setGroup({
            variables: {
                id: router.query.id,
                data: { ...data, __typename: undefined },
            },
        });

        router.push('/group');
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
