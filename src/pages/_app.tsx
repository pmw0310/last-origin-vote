/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import AppBar from '../components/AppBar';
import Container from '@material-ui/core/Container';
import { useApollo } from '../lib/apollo';

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
                <>
                    <AppBar />
                    <Container fixed style={{ paddingTop: '70px' }}>
                        <Component {...pageProps} />
                    </Container>
                </>
            )}
        </ApolloProvider>
    );
}
