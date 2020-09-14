module.exports = {
    webpack: (config, options) => {
        const { dir } = options;

        config.module.rules.push({
            test: /\.(graphql|gql)$/,
            include: [dir],
            exclude: /node_modules/,
            loader: 'graphql-tag/loader'
        });
        return config;
    },
    // webpackDevMiddleware: (config) => {
    //     return config;
    // },
};