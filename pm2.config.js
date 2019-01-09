module.exports = {
  apps: [
    {
      name: 'kc-0',
      script: 'server.js',
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 0
      }
    },
    {
      name: 'kc-1',
      script: 'server.js',
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 1
      }
    },
    {
      name: 'kc-2',
      script: 'server.js',
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 2
      }
    },
    {
      name: 'kc-3',
      script: 'server.js',
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 3
      }
    },
  ]
};