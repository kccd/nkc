module.exports = {
	apps: [
		{
			name: 'kc',
			script: 'server.js', //
			instances: 1, // 进程数量
			exec_mode: 'cluster', // 集群模式启动
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
			env: {
				NODE_ENV: 'production'
			}
		}
	]
};