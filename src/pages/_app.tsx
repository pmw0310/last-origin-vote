/* eslint-disable @typescript-eslint/no-explicit-any */

import 'react-lazy-load-image-component/src/effects/blur.css';
import 'swiper/swiper.scss';
import 'swiper/components/a11y/a11y.scss';
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/lazy/lazy.scss';

import { ApolloProvider } from '@apollo/client';
import AppBar from '../components/AppBar';
import AppContainer from '../components/AppContainer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Feedback from '../components/Feedback';
import Head from 'next/head';
import React from 'react';
import { RecoilRoot } from 'recoil';
import Webp from '../lib/Webp';
import { useApollo } from '../lib/apollo';

interface Props {
    Component: any;
    pageProps: any;
}

export default function App({ Component, pageProps }: Props): JSX.Element {
    const apolloClient = useApollo(pageProps.initialApolloState);

    return (
        <RecoilRoot>
            <ApolloProvider client={apolloClient}>
                <Head>
                    <title>라스트 오리진 투표</title>
                    <link rel="shortcut icon" href="/favicon.ico" />
                </Head>
                <Webp />
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
