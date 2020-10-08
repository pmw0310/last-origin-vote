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

    const onChange: React.ChangeEventHandler<HTMLInputElement> = ({
        target,
    }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [file] = target.files as any;

        if (target.validity.valid) {
            singleUploadMutation({
                variables: {
                    file,
                },
            });
        }
    };
    return (
        <div>
            <div>
                <label>Single Upload</label>
                <br />
                <input
                    type="file"
                    required
                    accept="image/jpeg, image/png"
                    onChange={onChange}
                />
            </div>
        </div>
    );
};

export default App;
