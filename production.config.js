module.exports = {
	apps: [
		{
			name: 'kc',
			script: 'server.js',
			instances: 4,
			exec_mode: 'cluster',
			log: 'log.txt',
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
			env: {
				NODE_ENV: 'production'
			}
		}
	]
};