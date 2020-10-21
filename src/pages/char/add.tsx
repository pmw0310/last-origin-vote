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
        grade: 0,
        lastGrade: 0,
        type: 0,
        role: 0,
        class: '',
        arm: '',
        stature: 0,
        weight: 0,
    });

    const [addCharacter] = useMutation(ADD_CHARACTER);
    const router = useRouter();

    const save = async () => {
        await addCharacter({
            variables: {
                data: { ...data, __typename: undefined },
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

// import React, { useState } from 'react';
// // import { gql } from '@apollo/client';
// import Editor from '../../components/Editor';
// import { CharacterInterface } from 'Module';

// // const CHARACTER = gql``;

// export default function AdddCharacter(): JSX.Element {
//     const [data, setData] = useState<CharacterInterface>({
//         name: '',
//         tag: [],
//         number: undefined,
//     });

//     const test = () => {
//         console.log(data);
//     };

//     return (
//         <>
//             <Editor data={data} setData={setData} type="character" />
//             <button onClick={test}>test!</button>
//         </>
//     );
// }
