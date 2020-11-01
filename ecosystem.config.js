module.exports = {
    apps: [
        {
            name: 'last-origin-app',
            script: './dist/index.js',
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            autorestart: true,
            env: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'crons-like',
            script: './dist_crons/index.js',
            instances: 1,
            exec_mode: 'fork',
            cron_restart: '0 0,15,30,45 * * * *',
            watch: false,
            autorestart: false,
            args: 'like',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
