/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import AppBar from '../components/AppBar';
import AppContainer from '../components/AppContainer';
import { useApollo } from '../lib/apollo';
import Snackbar from '../lib/Snackbar';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface Props {
    Component: any;
    pageProps: any;
}

export default function App({ Component, pageProps }: Props): JSX.Element {
    const apolloClient = useApollo(pageProps.initialApolloState);

    return (
        <ApolloProvider client={apolloClient}>
            {pageProps.statusCode === 404 ? (
                <Component {...pageProps} />
            ) : (
                <Snackbar>
                    <AppBar />
                    <AppContainer>
                        <Component {...pageProps} />
                    </AppContainer>
                </Snackbar>
            )}
        </ApolloProvider>
    );
}
