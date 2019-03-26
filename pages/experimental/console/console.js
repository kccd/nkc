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
    cs = io('/console', {
      forceNew: false,
      reconnection: true,
      autoConnect: true,
      transports: ['polling', 'websocket'],
      reconnectionDelay: 5000,
      reconnectionDelayMax: 10000
    });
    var vm = this;
    cs.on('connect', function() {
      vm.status = 'connect';
    });
    cs.on('connecting', function() {
      vm.status = 'connecting';
    });
    cs.on('disconnect', function(reason) {
      vm.status = 'disconnect';
    });
    cs.on('reconnecting', function() {
      vm.status = 'reconnecting';
    });
    cs.on('reconnect', function() {
      vm.status = 'connect';
    });
    cs.on('connect_failed', function() {
      vm.status = 'connect_failed';
    });
    cs.on('reconnect_failed', function() {
      vm.status = 'reconnect_failed';
    });
    cs.on('error', function(err) {
      console.log(err);
      vm.status = 'error';
    });
    cs.on('connect_timeout', function() {
      vm.status = 'connect_timeout';
    });
    cs.on('message', function(data) {
      if(vm.messages.length > 2000) {
        vm.messages.splice(0, 1);
      }
      vm.messages.push(data);
    });
  },
  methods: {
    format: format,
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