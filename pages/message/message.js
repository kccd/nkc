var app;

var winWidth = $(window).width();

var xss = window.filterXSS;

var data = document.getElementById('data').innerText;

data = JSON.parse(data);

var targetUid = data.targetUid;

$(function() {

  app = new Vue({
    el: '#app',
    data: {
      mobile: winWidth < 1100,
      userList: [],
      target: '',
      targetUser: '',
      socketStatus: ''
    },
    computed: {
      socketInfo: function () {
        if(!this.socketStatus) {
          return {
            text: '暂未连接'
          }
        }
        return {
          'connect_timeout': {
            text: '连接超时，请刷新',
            color: 'red'
          },
          'error': {
            text: '连接失败，请刷新',
            color: 'red'
          },
          'connecting': {
            text: '正在连接...',
            color: 'blue'
          },
          'connect': {
            text: '已连接',
            color: 'green'
          },
          'disconnect': {
            text: '连接已断开，您将不能实时接收信息，请刷新',
            color: 'red'
          },
          'reconnecting': {
            text: '正在重新连接...',
            color: 'blue'
          },
          'reconnect_failed': {
            text: '重新连接失败，您将不能实时接收信息，请刷新',
            color: 'red'
          },
          'connect_failed': { // 重新连接失败
            text: '连接失败，您将不能实时接收信息，请刷新',
            color: 'red'
          },
          'notConnect': {
            text: '未连接',
            color: 'red'
          }
        }[this.socketStatus];
      },
    },

    methods: {
      format: format,
      // 选择用户列表中的某个用户
      selectUser: function(item) {
        if(item.type === 'UTU') {
          app.target = 'user';
          app.targetUser = item.user;
        }

      }
    },

    mounted: function() {
      getUserList();
    }
  })
});


function getUserList() {

  return new Promise(function(resolve, reject) {

    nkcAPI('/message', 'GET', {})
      .then(function(data) {
        app.userList = data.userList;
        resolve();
      })
      .catch(function(data) {
        screenTopAlert(data.error || data);
        reject();
      })

  });

}

function getMessage(item) {

}