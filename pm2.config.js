module.exports = {
  apps: [
    {
      name: 'nkc',
      script: 'server.js',
      shutdown_with_message: true,
      wait_ready: true,
      instances: 12,
      exec_mode: 'cluster',
      restart_delay: 5000, // 崩溃后重启前的等待毫秒数
      increment_var: 'PROCESS_ID',
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 0,
      }
    },
    {
      name: 'socket',
      script: 'socketServer.js',
      wait_ready: true,
      shutdown_with_message: true,
      instances: 8,
      exec_mode: 'cluster',
      restart_delay: 5000, // 崩溃后重启前的等待毫秒数
      increment_var: 'PROCESS_ID',
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 0,
      }
    },
    {
      name: 'timed task',
      script: 'timedTask.js',
      wait_ready: true,
      shutdown_with_message: true,
      restart_delay: 5000, // 崩溃后重启前的等待毫秒数
      increment_var: 'PROCESS_ID',
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 0,
      }
    },
    {
      name: 'communication',
      script: 'communicationServer.js',
      wait_ready: true,
      shutdown_with_message: true,
      restart_delay: 5000, // 崩溃后重启前的等待毫秒数
      increment_var: 'PROCESS_ID',
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 0,
      }
    }
  ]
};
