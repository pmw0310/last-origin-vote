import React from 'react';
import Document, { DocumentContext } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static async getInitialProps(ctx: DocumentContext) {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) =>
                        sheet.collectStyles(<App {...props} />),
                });

            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
            };
        } finally {
            sheet.seal();
        }
    }
}

// import React from 'react';
// import Document, {
//     DocumentContext,
//     Html,
//     Main,
//     NextScript,
//     Head,
// } from 'next/document';
// import { ServerStyleSheet, createGlobalStyle } from 'styled-components';
// const GlobalStyles = createGlobalStyle`
//        html body {
//             height: 100%;
//             overflow: auto;
//             margin: 0;
//             background-color: #F3F5F8;
//           }
//           #__next {
//             height: 100%;
//           }
// `;
// export default class MyDocument extends Document<{
//     // eslint-disable-next-line @typescript-eslint/ban-types
//     styleTags: Array<React.ReactElement<{}>>;
// }> {
//     // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
//     static async getInitialProps(context: DocumentContext) {
//         const sheet = new ServerStyleSheet();
//         const page = context.renderPage((App) => (props) =>
//             sheet.collectStyles(
//                 <>
//                     <GlobalStyles />
//                     <App {...props} />
//                 </>,
//             ),
//         );
//         const styleTags = sheet.getStyleElement();
//         return { ...page, styleTags };
//     }
//     render(): JSX.Element {
//         return (
//             <Html>
//                 <Head>{this.props.styleTags}</Head>
//                 <body>
//                     <Main />
//                     <NextScript />
//                 </body>
//             </Html>
//         );
//     }
// }
