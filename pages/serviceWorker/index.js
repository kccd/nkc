importScripts("/serviceWorker/socket.io.min.js");

self.addEventListener("install", event => self.skipWaiting());

const query = {
  serviceWorker: true,
  data: {},
}

const socket = io("/common", {
  forceNew: false,
  reconnection: true,
  autoConnect: true,
  transports: ["polling", "websocket"],
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000,
  jsonp: false,
  query
});

// 可以取到当前所有的同源页面
function attachClients() {
  return self.clients.matchAll({
    includeUncontrolled: true,
    type: "window"
  });
}

// 发送消息到所有页面
function postMessageToClients(data) {
  attachClients()
    .then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage(data);
      });
    })
}

socket.on("connect", function() {
  console.log("service worker socket.io 连接成功");
});
socket.on("disconnect", function() {
  console.log("service worker socket.io 连接断开");
});

// socket.io触发任何事件时都要传递到页面去
socket.onAny(function() {
  const args = [].slice.call(arguments);
  // console.log("触发事件: ", args);
  postMessageToClients({
    type: "socket_event_trigger",
    detail: {
      name: args[0],
      args: args.slice(1)
    }
  });
});

// 页面发过来的消息
self.addEventListener("message", event => {
  console.log("页面发来的消息: ", event);
});
