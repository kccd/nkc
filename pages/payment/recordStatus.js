var data = NKC.methods.getDataById('data');

var app = new Vue({
  el: '#app',
  data: {
    uid: NKC.configs.uid,
    apiType: data.record.apiType,
    recordId: data.record.recordId,
    recordStatus: data.record.status,
    url: data.record.url,
    delay: [1000, 1000, 1000, 2000, 2000, 2000, 5000, 5000, 5000, 10000]
  },
  computed: {
    recordStatusDesc: function() {
      return ({
        'waiting': '等待支付...',
        'success': '支付已完成',
        'fail': '支付失败，请关闭当前页面重新发起支付',
        'timeout': '支付超时，请关闭当前页面重新发起支付'
      })[this.recordStatus];
    }
  },
  methods: {
    getRecordStatus: function() {
      var self = this;
      return nkcAPI('/payment/wechat/' + this.recordId, 'GET')
        .then(function(data) {
          self.recordStatus = data.record.status;
        })
        .catch(function(err) {
          screenTopWarning(err);
        });
    },
    setRecordTimeout() {
      if(this.recordStatus !== 'waiting') return;
      var self = this;
      var t;
      if(self.delay.length === 1) {
        t = self.delay[0];
      } else {
        t = self.delay.shift();
      }
      setTimeout(function() {
        self.getRecordStatus()
          .then(function() {
            self.setRecordTimeout();
          });
      }, t);
    },
    toPay: function() {
      var apiType = this.apiType;
    }
  },
  mounted: function() {
    this.setRecordTimeout();
    if(this.recordStatus === 'waiting') this.toPay();
  }
});

window.app = app;
