/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Document, {
    DocumentContext,
    DocumentInitialProps,
    Html,
    Head,
    Main,
    NextScript,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { ServerStyleSheets } from '@material-ui/styles';

export default class MyDocument extends Document {
    static async getInitialProps(
        ctx: DocumentContext,
    ): Promise<DocumentInitialProps> {
        const styledComponentsSheet = new ServerStyleSheet();
        const materialSheets = new ServerStyleSheets();
        const originalRenderPage = ctx.renderPage;
        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) =>
                        styledComponentsSheet.collectStyles(
                            materialSheets.collect(<App {...props} />),
                        ),
                });
            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {materialSheets.getStyleElement()}
                        {styledComponentsSheet.getStyleElement()}
                    </>
                ),
            };
        } finally {
            styledComponentsSheet.seal();
        }
    }
    render() {
        return (
            <Html lang="en" dir="ltr">
                <Head>{this.props.styles}</Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
    // static getInitialProps(
    //     ctx: DocumentContext,
    // ): Promise<DocumentInitialProps> {
    //     const sheet = new ServerStyleSheet();
    //     const page = ctx.renderPage((App) => (props) =>
    //         sheet.collectStyles(<App {...props} />),
    //     );
    //     const styleTags = sheet.getStyleElement();
    //     return { ...page, styleTags } as any;
    // }
    // render() {
    //     return (
    //         <Html>
    //             <Head>{(this.props as any).styleTags}</Head>
    //             <body>
    //                 <Main />
    //                 <NextScript />
    //             </body>
    //         </Html>
    //     );
    // }
}
