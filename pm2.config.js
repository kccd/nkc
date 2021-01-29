module.exports = {
  apps: [
    {
      name: 'communication',
      script: 'server.js',
      cwd: "./microServices/communication/",
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
      name: 'socket',
      script: 'socketServer.js',
      cwd: "./",
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
      name: 'nkc',
      script: 'server.js',
      cwd: "./",
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
      name: 'timed task',
      script: 'timedTask.js',
      cwd: './',
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
      name: 'proxy',
      script: 'server.js',
      cwd: "./microServices/proxy/",
      wait_ready: true,
      shutdown_with_message: true,
      instances: 2,
      exec_mode: 'cluster',
      restart_delay: 5000, // 崩溃后重启前的等待毫秒数
      increment_var: 'PROCESS_ID',
      env: {
        NODE_ENV: 'production',
        PROCESS_ID: 0,
      }
    }
  ]
};
