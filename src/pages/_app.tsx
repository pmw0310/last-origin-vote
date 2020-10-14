/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import App from 'next/app';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ApolloProvider } from '@apollo/react-hooks';
import withApolloClient from '../lib/apollo';
import AppBar from '../components/AppBar';
import Container from '@material-ui/core/Container';

interface Props {
    apollo: ApolloClient<NormalizedCacheObject>;
}

class MyApp extends App<Props> {
    render() {
        const { Component, pageProps, apollo } = this.props;

        return (
            <ApolloProvider client={apollo}>
                <AppBar />
                <Container fixed style={{ paddingTop: '70px' }}>
                    <Component {...pageProps} />
                </Container>
            </ApolloProvider>
        );
    }
}

export default withApolloClient(MyApp);
