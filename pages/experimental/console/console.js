var cs;
var app = new Vue({
  el: '#app',
  data: {
    status: 'disconnect',
    categories: ['web', 'socket'],
    messages: [],
    message: ''
  },
  computed: {
    messageInfo: function() {
      if(!this.message) return '';
      var message = JSON.stringify(this.message, '', 4);
      message = message.replace(/\n/g, '<br/>');
      message = message.replace(/\s/g, '&nbsp;');
      return message;
    },
    statusString: function() {
      switch(this.status){
        case 'connect': return '连接成功';
        case 'connecting': return '连接中...';
        case 'disconnect': return '连接已断开';
        case 'reconnecting': return '正在重新连接...';
        case 'connect_failed': return '连接失败，请刷新';
        case 'reconnect_failed': return '重新连接失败，请刷新';
        case 'error': return '连接出错，请刷新';
        case 'connect_timeout': return '连接超时';
      }
    }
  },
  mounted: function() {
    var vm = this;
    if(socket.connected) {
      vm.status = "connect";
    }
    socket.on('connect', function() {
      vm.status = "connect";
    });
    socket.on('consoleMessage', function(data) {
      console.log(data)
      if(vm.messages.length > 500) {
        vm.messages.splice(0, 1);
      }
      vm.messages.push(data);
    });
  },
  methods: {
    format: NKC.methods.format,
    selectMessage: function(m) {
      this.message = m;
    }
  },
  updated: function() {
    var panel = app.$refs.panel;
    if(panel.scrollTop + panel.clientHeight >= panel.scrollHeight-300) {
      panel.scrollTo(0,999999999999999999999)
    }
  }
});
