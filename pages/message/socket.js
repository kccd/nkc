/*
var socket = io('/');
socket.on('connect', function () {
  console.log('服务器连接成功');
});

socket.kcEmit = function(eventName, data) {
  return new Promise(function(resolve, reject){
    socket.emit(eventName, data, function(d) {
      if(!d) return reject('server did not return');
      if(!d.status) return reject(d.data);
      resolve(d.data);
    })
  })
};

function connectMessageSocket(url) {
  return new Promise(function(resolve, reject) {
    var socket = io('/');
    socket.on('connect', function() {
      resolve();
    });
  });
}*/
