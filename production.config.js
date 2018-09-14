module.exports = {
	apps: [
		{
			name: 'kc',
			script: 'server.js',
			instances: 12,
			exec_mode: 'cluster',
			env: {
				NODE_ENV: 'production'
			}
		},
		{
			name: 'auto_backup',
			script: 'auto_backup.js'
		}
	]
};