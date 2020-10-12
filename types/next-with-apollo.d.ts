/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'next-with-apollo' {
    import { ApolloClient } from '@apollo/client';
    import { IncomingHttpHeaders } from 'http';
    import { NextPage, NextPageContext } from 'next';
    import App, { AppContext } from 'next/app';
    import React, { ReactNode } from 'react';
    import 'isomorphic-unfetch';

    export interface WithApolloOptions {
        getDataFromTree?: (
            tree: ReactNode,
            context?: {
                [key: string]: any;
            },
        ) => Promise<any>;
        render?: (props: { Page: NextPage<any>; props: any }) => any;
        onError?: (error: Error, ctx?: NextPageContext) => void;
    }
    export interface WithApolloState<TCache> {
        data?: TCache;
    }
    export interface WithApolloProps<TCache> {
        apolloState: WithApolloState<TCache>;
        apollo: ApolloClient<TCache>;
    }
    export interface InitApolloOptions<TCache> {
        ctx?: NextPageContext;
        headers?: IncomingHttpHeaders;
        initialState?: TCache;
    }
    export declare type InitApolloClient<TCache> = (
        options: InitApolloOptions<TCache>,
    ) => ApolloClient<TCache>;
    export interface ApolloPageContext<C = any> extends NextPageContext {
        apolloClient: ApolloClient<C>;
    }
    export interface ApolloAppContext<C = any> extends AppContext {
        ctx: ApolloPageContext<C>;
        AppTree: any;
    }
    export declare type ApolloContext<C = any> =
        | ApolloPageContext<C>
        | ApolloAppContext<C>;

    export function initApollo<TCache = any>(
        clientFn: InitApolloClient<TCache>,
        options?: InitApolloOptions<TCache>,
    ): ApolloClient<TCache>;

    export function withApollo<TCache = any>(
        client: InitApolloClient<TCache>,
        options?: WithApolloOptions,
    ): (
        Page:
            | typeof App
            | (React.ComponentClass<any, any> & {
                  getInitialProps?(
                      context: import('next').NextPageContext,
                  ): any;
              })
            | (React.FunctionComponent<any> & {
                  getInitialProps?(
                      context: import('next').NextPageContext,
                  ): any;
              }),
        pageOptions?: WithApolloOptions,
    ) => {
        ({
            apollo,
            apolloState,
            ...props
        }: Partial<WithApolloProps<TCache>>): any;
        displayName: string;
        getInitialProps(pageCtx: ApolloContext<any>): Promise<{}>;
    };
}
