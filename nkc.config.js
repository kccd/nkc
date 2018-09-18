module.exports = {
  apps: [
    {
      name: 'nkc',
      script: 'newServer.js', //
      restart_delay: 10000, // 崩溃后重启前的等待毫秒数
      env: {
        NODE_ENV: 'production',
        PROCESS_COUNT: 4
      }
    }
  ]
};