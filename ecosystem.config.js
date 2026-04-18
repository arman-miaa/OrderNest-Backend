module.exports = {
    apps: [
        {
            name: 'starter_backend',
            script: './dist/server.js',
            args: 'start',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
}; 