module.exports = {
	apps: [
		{
			name: 'kc',
			script: 'server.js',
			watch: true,
			log: 'log.txt',
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
			env: {
				NODE_ENV: 'development'
			}
		}
	]
};