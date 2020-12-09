const path = require('path')

const isProd = process.env.APP_ENV === 'prodcution';

module.exports = {
    webpack: (config) => {
        return config;
    },
    webpackDevMiddleware: (config) => {
        return config;
    },
    images: {
        domains: isProd ? ['lov.blackolf.com', 'lovs.blackolf.com'] : ['lov.blackolf.com', 'lovs.blackolf.com', 'localhost'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    env: {
        SERVER_URI: isProd ? 'https://lovs.blackolf.com' : 'http://localhost:4001',
        // IMAGE_URI: isProd ? undefined : 'https://lovs.blackolf.myds.me',
    }
};