module.exports = {
	apps: [
		{
			name: 'kc',
			script: 'server.js',
			instances: 4,
			exec_mode: 'cluster',
			env: {
				NODE_ENV: 'production'
			}
		}
	]
};