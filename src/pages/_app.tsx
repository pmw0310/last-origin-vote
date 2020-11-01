/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/client';
import AppBar from '../components/AppBar';
import AppContainer from '../components/AppContainer';
import { useApollo } from '../lib/apollo';
import Feedback from '../components/Feedback';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface Props {
    Component: any;
    pageProps: any;
}

export default function App({ Component, pageProps }: Props): JSX.Element {
    const apolloClient = useApollo(pageProps.initialApolloState);

    return (
        <ApolloProvider client={apolloClient}>
            <Head>
                <title>라스트 오리진 투표</title>
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            {pageProps.statusCode === 404 ? (
                <Component {...pageProps} />
            ) : (
                <Feedback>
                    <AppBar />
                    <AppContainer>
                        <Component {...pageProps} />
                    </AppContainer>
                </Feedback>
            )}
        </ApolloProvider>
    );
}
