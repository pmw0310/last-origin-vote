import React, { useRef } from 'react';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Image from 'next/image';
import { ReactSVG } from 'react-svg';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import packageJson from '../../package.json';
import styled from 'styled-components';
import { toImage } from '../lib/info';
import useWidth from '../lib/useWidth';

const creditsData: Array<{
    type: 'image' | 'svg' | 'text';
    image?: string;
    name: string;
    color?: string;
    link: string;
    cols?: number;
}> = [
    {
        type: 'svg',
        image: '/public/credits/nodejs.svg',
        link: 'https://nodejs.org/ko',
        name: 'Node.js',
    },
    {
        type: 'image',
        image: '/public/credits/Nextjs-logo.png',
        link: 'https://nextjs.org',
        name: 'Next.js',
    },
    {
        type: 'image',
        image: '/public/credits/Typescript.png',
        link: 'https://www.typescriptlang.org',
        name: 'Typescript',
    },
    {
        type: 'svg',
        image: '/public/credits/tsnode.svg',
        link: 'https://www.npmjs.com/package/ts-node',
        name: 'TSnode',
    },
    {
        type: 'image',
        image: '/public/credits/koa.png',
        link: 'https://koajs.com',
        name: 'koa',
    },
    {
        type: 'image',
        image: '/public/credits/react.png',
        link: 'https://ko.reactjs.org',
        name: 'React',
    },
    {
        type: 'image',
        image: '/public/credits/mongodb.png',
        link: 'https://www.mongodb.com',
        name: 'mongoDB',
    },
    {
        type: 'image',
        image: '/public/credits/mongoos.png',
        link: 'https://mongoosejs.com',
        name: 'mongoos',
    },
    {
        type: 'image',
        image: '/public/credits/apollo.png',
        link: 'https://www.apollographql.com',
        name: 'Apollo',
    },
    {
        type: 'svg',
        image: '/public/credits/graphql.svg',
        link: 'https://graphql.org',
        name: 'GraphQL',
    },
    {
        type: 'image',
        image: '/public/credits/typegraphql.png',
        link: 'https://www.npmjs.com/package/type-graphql',
        name: 'TypeGraphQL',
    },
    {
        type: 'image',
        image: '/public/credits/sc.png',
        link: 'https://styled-components.com',
        name: 'styled components',
    },
    {
        type: 'svg',
        image: '/public/credits/mu.svg',
        link: 'https://material-ui.com',
        name: 'React Material-UI',
    },
    {
        type: 'svg',
        image: '/public/credits/immer-logo.svg',
        link: 'https://www.npmjs.com/package/immer',
        name: 'immer',
    },
    {
        type: 'image',
        image: '/public/credits/redis.png',
        link: 'https://redis.io',
        name: 'redis',
    },
    {
        type: 'image',
        image: '/public/credits/echarts.png',
        link: 'https://echarts.apache.org/en/index.html',
        name: 'Echarts',
    },
    {
        type: 'svg',
        image: '/public/credits/egjs.svg',
        link: 'https://naver.github.io/egjs',
        name: 'egjs',
    },
    {
        type: 'svg',
        image: '/public/credits/helmet.svg',
        link: 'https://helmetjs.github.io',
        name: 'Helmet',
    },
];

const Title = styled(GridListTile)`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px !important;
    cursor: pointer;
`;

const height = 90;

const Credits = (): JSX.Element => {
    const ref = useRef<HTMLDivElement>(null);
    const [width] = useWidth(ref);

    return (
        <div ref={ref} style={{ backgroundColor: 'rgb(207, 232, 252)' }}>
            <>
                <Typography variant="h3" gutterBottom>
                    {packageJson.name}
                </Typography>
                <Typography variant="h5" gutterBottom>
                    {packageJson.version}
                </Typography>
            </>
            <GridList
                cellHeight={height}
                cols={width ? Math.floor(width / (height * 2.5)) : 4}
            >
                {creditsData.map((data, index) => {
                    return (
                        <Title
                            key={index}
                            cols={data.cols || 1}
                            onClick={() => {
                                window.open(data.link);
                            }}
                        >
                            <Tooltip title={data.name}>
                                {data.type === 'image' ? (
                                    <div
                                        style={{
                                            width: `${
                                                (width as number) /
                                                Math.floor(
                                                    (width as number) /
                                                        (height * 2.5),
                                                )
                                            }px`,
                                            height: `${height - 20}px`,
                                        }}
                                    >
                                        <Image
                                            src={toImage(data.image) as string}
                                            layout="fill"
                                            objectFit="contain"
                                        />
                                    </div>
                                ) : data.type === 'svg' ? (
                                    <ReactSVG
                                        src={toImage(data.image) as string}
                                        beforeInjection={(svg) => {
                                            svg.setAttribute(
                                                'style',
                                                `width: auto; height: ${
                                                    height - 20
                                                }px;`,
                                            );
                                        }}
                                        wrapper="span"
                                    />
                                ) : (
                                    <div />
                                )}
                            </Tooltip>
                        </Title>
                    );
                })}
            </GridList>
        </div>
    );
};

export default Credits;
