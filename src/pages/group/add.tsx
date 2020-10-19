import React, { useState } from 'react';
import EditorForm from '../../components/EditorForm';
import { GroupInterface } from 'Module';

const AdddCharacter = (): JSX.Element => {
    const [data, setData] = useState<GroupInterface>({
        name: '',
        tag: [],
        image: '',
        description: '',
    });

    const test = async () => {
        await console.log(data);
    };

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
