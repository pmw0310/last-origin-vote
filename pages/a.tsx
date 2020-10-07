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

    const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        const files = e.target.files as FileList;
        const file = files[0];
        console.log('file', file);
        await singleUploadMutation({
            variables: {
                file: file,
            },
        });
    };
    return (
        <div>
            <div>
                <label>Single Upload</label>
                <br />
                <input type="file" onChange={onChange} />
            </div>
        </div>
    );
};

export default App;
