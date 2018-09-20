module.exports = {
  apps: [
    {
      name: 'nkc',
      script: 'newServer.js',
      instances: 4, // 进程数量
      exec_mode: 'cluster', // 集群模式启动
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
      env: {
        NODE_ENV: 'production',
        PROCESS_COUNT: 4
      }
    },
    {
      name: 'socket',
      script: 'socketIo.js',
      restart_delay: 10000
    }
  ]
};