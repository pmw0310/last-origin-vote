import React, { useEffect } from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import { useRouter } from 'next/router';

const Test = (): JSX.Element => {
    const router = useRouter();

    useEffect(() => {
        if (!router.query.auth) {
            return;
        }

        axios
            .get(
                `${process.env.SERVER_URI}/api/auth/login?auth=${router.query.auth}`,
                { withCredentials: true },
            )
            .finally(() => {
                location.href = '/';
            });
    }, [router]);

    return (
        <Backdrop
            open={true}
            style={{ backgroundColor: 'white', zIndex: 9999999 }}
        >
            <CircularProgress color="primary" size={62} />
        </Backdrop>
    );
};

export default Test;
