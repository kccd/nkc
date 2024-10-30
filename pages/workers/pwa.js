self.addEventListener('install', () => {
  console.log('Service Worker 安装成功');
  self.skipWaiting(); // 立即激活
});

// 激活事件
self.addEventListener('activate', () => {
  console.log('Service Worker 激活成功');
});
