import React, { useState } from 'react';
// import { gql } from '@apollo/client';
import Editor from '../../components/characterEditor';
import { CharacterInterface } from 'Module';

// const CHARACTER = gql``;

export default function AdddCharacter(): JSX.Element {
    const [data, setData] = useState<CharacterInterface>({
        name: '',
        tag: [],
    });

    const test = () => {
        console.log(data);
    };

    return (
        <>
            <Editor data={data} setData={setData} />
            <button onClick={test}>test!</button>
        </>
    );
}
