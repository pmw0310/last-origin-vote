import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EditorForm from '../../components/EditorForm';
import { GroupInterface } from 'Module';
import { gql, useLazyQuery } from '@apollo/client';

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

const AdddCharacter = (): JSX.Element => {
    const router = useRouter();

    const [data, setData] = useState<GroupInterface>({});
    const [getGroup, { data: group, error }] = useLazyQuery(GET_GROUP);

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

    const test = async () => {
        await console.log(data);
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
                title="그룹 추가"
                subtitle="그룹 추가"
                onClickSave={test}
            />
        </>
    );
};

export default AdddCharacter;
