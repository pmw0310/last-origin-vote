/* eslint-disable prettier/prettier */
module.exports = {
    apps: [{
            name: 'last-origin-app',
            script: 'yarn',
            args: 'start',
            cwd: '/home/node/app/',
            instances: 0,
            exec_mode: 'cluster',
            watch: false,
            autorestart: true,
            env: {
                NODE_ENV: 'production',
                SERVER_URI: ''
            },
        }, {
            name: 'last-origin-server',
            script: './dist/index.js',
            cwd: '/home/node/app/',
            instances: 0,
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
            args: 'like',
            cwd: '/home/node/app/',
            instances: 1,
            exec_mode: 'fork',
            cron_restart: '0 0,15,30,45 * * * *',
            watch: false,
            autorestart: false,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};