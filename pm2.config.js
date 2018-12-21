module.exports = {
  apps: [
    {
      name: 'kc',
      script: 'server.js',
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 0
      }
    }
  ]
};