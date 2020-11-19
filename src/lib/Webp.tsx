import React, { useEffect } from 'react';

import { makeVar } from '@apollo/client';

export const webpVar = makeVar<boolean | undefined>(undefined);

const Webp = (): JSX.Element => {
    useEffect(() => {
        const image = new Image();
        const webpdata =
            'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        image.onerror = () => {
            webpVar(false);
        };
        image.onload = () => {
            const result = image.width > 0 && image.height > 0;
            if (result) {
                console.log('use webp');
                webpVar(true);
            } else {
                console.log('no webp');
                webpVar(false);
            }
        };
        image.src = webpdata;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <></>;
};

export default Webp;
