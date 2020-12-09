/* eslint-disable @typescript-eslint/no-explicit-any */

import 'react-lazy-load-image-component/src/effects/blur.css';

import { ApolloProvider } from '@apollo/client';
import AppBar from '../components/AppBar';
import AppContainer from '../components/AppContainer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Feedback from '../components/Feedback';
import Head from 'next/head';
import React from 'react';
import { RecoilRoot } from 'recoil';
import { useApollo } from '../lib/apollo';

interface Props {
    Component: any;
    pageProps: any;
}

export default function App({ Component, pageProps }: Props): JSX.Element {
    const apolloClient = useApollo(pageProps);

    return (
        <RecoilRoot>
            <ApolloProvider client={apolloClient}>
                <Head>
                    <title>라스트 오리진 투표</title>
                    <meta name="description" content="라스트 오리진 투표 순위" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="라스트 오리진 투표" />
                    <meta property="og:description" content="라스트 오리진 투표 순위" />
                    <meta property="og:image" content="https://lov.blackolf.com/lov.png" />
                    <meta property="og:url" content="https://lov.blackolf.com" />
                    <meta name="naver-site-verification" content="1d53140e1a1bb4a0d91b75714be63bcd9e824877" />
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <link rel="apple-touch-icon" href="/lov.png" />
                    <link rel="apple-touch-icon-precomposed" href="/lov.png" />
                    <link rel="shortcut icon" href="/lov.png" />
                    <link rel="icon" href="/lov.png" />
                </Head>
                {pageProps.statusCode === 404 ? (
                    <Component {...pageProps} />
                ) : (
                    <Feedback>
                        <CssBaseline />
                        <AppBar />
                        <AppContainer>
                            <Component {...pageProps} />
                        </AppContainer>
                    </Feedback>
                )}
            </ApolloProvider>
        </RecoilRoot>
    );
}
