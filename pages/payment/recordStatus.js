const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    uid: NKC.configs.uid,
    from: data.record.from,
    type: data.record.type,
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
      const self = this;
      const url = this.type === 'aliPay'? `/payment/alipay/${this.recordId}`: `/payment/wechat/${this.recordId}`;
      return nkcAPI(url, 'GET')
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
    }
  },
  mounted: function() {
    this.setRecordTimeout();
  }
});

window.app = app;
