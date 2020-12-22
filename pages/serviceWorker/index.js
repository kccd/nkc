importScripts("/socket.io-client/dist/socket.io.js");

self.addEventListener('install', event => {
  return self.skipWaiting()
})

self.addEventListener("message",  function(event){
  let message = event.data;
  console.log(message);
})

// var socket = io('/common', {
//   forceNew: false,
//   reconnection: true,
//   autoConnect: true,
//   transports: ['polling', 'websocket'],
//   reconnectionDelay: 5000,
//   reconnectionDelayMax: 10000,
//   query: {
//     operationId: "reviewForum",
//     data: {},
//   },
//   jsonp: false
// });

// // socket.open();

// socket.on('connect', function () {
//   console.log('Service Worker socket连接成功');
// });
// socket.on('error', function() {
//   console.log('Service Worker socket连接出错');
//   socket.disconnect();
// });
// socket.on('disconnect', function() {
//   console.log('Service Worker socket连接已断开');
// });