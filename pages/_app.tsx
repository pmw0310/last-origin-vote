/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import App, { Container } from 'next/app';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ApolloProvider } from '@apollo/react-hooks';
import withApolloClient from '../src/apollo';

interface Props {
    apollo: ApolloClient<NormalizedCacheObject>;
}

class MyApp extends App<Props> {
    render() {
        const { Component, pageProps, apollo } = this.props;

        return (
            <Container>
                <ApolloProvider client={apollo}>
                    <Component {...pageProps} />
                </ApolloProvider>
            </Container>
        );
    }
}

export default withApolloClient(MyApp);
