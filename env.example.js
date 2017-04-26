var env = {
    node_env: 'local',
    listen_port: '8000',
    mongo: {
        host: 'localhost',
        port: '27017',
        database: 'borekill_logs'
    },
    redis: {
        host: 'localhost',
        port: '6379'
    }
};

module.exports.env = env;
