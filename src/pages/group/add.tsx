import React, { useState } from 'react';
import Editor from '../../components/CharacterEditor';
import { GroupInterface } from 'Module';

export default function AdddCharacter(): JSX.Element {
    const [data, setData] = useState<GroupInterface>({
        name: '',
        tag: [],
    });

    const test = () => {
        console.log(data);
    };

    return (
        <>
            <Editor data={data} setData={setData} type="group" />
            <button onClick={test}>test!</button>
        </>
    );
}
