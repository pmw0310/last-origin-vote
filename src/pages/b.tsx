import React from 'react';
import Link from 'next/link';

export default function B(): JSX.Element {
    return (
        <div>
            <Link href="/" as="/">
                <a>root</a>
            </Link>
        </div>
    );
}
