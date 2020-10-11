import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/react-hooks';

const SINGLEUPLOAD = gql`
    mutation imageUpload($file: Upload!) {
        imageUpload(upload: $file)
    }
`;

const App: React.FC = () => {
    const [singleUploadMutation] = useMutation(SINGLEUPLOAD);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = async ({
        target: {
            files,
            validity: { valid },
        },
    }) => {
        const file = (files as FileList)[0];

        if (valid) {
            const test = await singleUploadMutation({
                variables: {
                    file,
                },
            });

            console.log('test', test);
        }
    };
    return (
        <>
            <label>Single Upload</label>
            <br />
            <input
                type="file"
                required
                accept="image/jpeg, image/png"
                onChange={onChange}
            />
        </>
    );
};

export default App;
