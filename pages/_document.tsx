import React from 'react';
import Document, {
    DocumentContext,
    Html,
    Main,
    NextScript,
    Head,
} from 'next/document';
import { ServerStyleSheet, createGlobalStyle } from 'styled-components';
const GlobalStyles = createGlobalStyle`
       html body {
            height: 100%;
            overflow: auto;
            margin: 0;
          }
          #__next {
            height: 100%;
          }
`;
export default class MyDocument extends Document<{
    // eslint-disable-next-line @typescript-eslint/ban-types
    styleTags: Array<React.ReactElement<{}>>;
}> {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static async getInitialProps(context: DocumentContext) {
        const sheet = new ServerStyleSheet();
        const page = context.renderPage((App) => (props) =>
            sheet.collectStyles(
                <>
                    <GlobalStyles />
                    <App {...props} />
                </>,
            ),
        );
        const styleTags = sheet.getStyleElement();
        return { ...page, styleTags };
    }
    render(): JSX.Element {
        return (
            <Html>
                <Head>{this.props.styleTags}</Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
