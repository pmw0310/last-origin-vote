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
        domains: [isProd ? 'lov.blackolf.com' : 'localhost'],
        imageSizes: [32, 48, 150],
    },
    env: {
        SERVER_URI: isProd ? 'https://lov.blackolf.com' : 'http://localhost:4000',
    }
};