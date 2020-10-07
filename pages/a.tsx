import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/react-hooks';
const SINGLEUPLOAD = gql`
    mutation imageUpload($file: Upload!) {
        imageUpload(file: $file)
    }
`;

const App: React.FC = () => {
    const [singleUploadMutation] = useMutation(SINGLEUPLOAD);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        const files = e.target.files;
        if (files && files.length === 1) {
            const file = files[0];
            console.log('file', file);
            const {
                data: { singleUpload },
            } = await singleUploadMutation({
                variables: {
                    file,
                },
            });
            console.log(`upload success😀 ${singleUpload.filename}`);
        } else {
            const data = await singleUploadMutation({
                variables: {
                    files,
                },
            });
            console.log(`upload success ${data}`);
        }
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
