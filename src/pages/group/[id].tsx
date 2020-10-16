/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { useRouter } from 'next/router';

export default function Test(): JSX.Element {
    const router = useRouter();
    console.log(router.query);
    return <>test</>;
}
