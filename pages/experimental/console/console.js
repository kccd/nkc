var cs;

var app = new Vue({
  el: '#app',
  data: {
    status: 'disconnect',
    categories: ['http', 'socket'],
    messages: [],
    message: '',
    pauseConsole: false,
    pauseTime: null,
  },
  watch: {
    pauseConsole: function() {
      if(this.pauseConsole && !this.pauseTime) {
        this.pauseTime = Date.now();
      }
      if(!this.pauseConsole && this.pauseTime) {
        this.pauseTime = null;
      }
    }
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
      return this.status.name;
    }
  },
  mounted: function() {
    var vm = this;
    addSocketStatusChangedEvent(function(event) {
      vm.status = event;
    });

    socket.on('connect', function() {
      vm.joinRoom();
    });

    socket.on('consoleMessage', function(data) {
      if(vm.messages.length > 500) {
        vm.messages.splice(0, 1);
      }
      vm.messages.push(data);
    });

    vm.joinRoom();

  },
  methods: {
    format: NKC.methods.format,
    joinRoom: function() {
      socket.emit('joinRoom', {
        type: 'console'
      });
    },
    selectMessage: function(m) {
      this.message = m;
    }
  },
  updated: function() {
    var panel = app.$refs.panel;
    if(panel.scrollTop + panel.clientHeight >= panel.scrollHeight-50) {
      panel.scrollTo(0,999999999999999999999)
    }
  }
});
