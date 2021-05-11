const data = NKC.methods.getDataById('data');
data.applications.map(a => {
  a._status = 'pending';
});
const app = new Vue({
  el: '#app',
  data: {
    applications: data.applications,
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    timeFormat: NKC.methods.timeFormat,
    getUrl: NKC.methods.tools.getUrl,
    checkString: NKC.methods.checkData.checkString,
    close(a) {
      a._status = 'pending';
    },
    submit(a) {
      const {_status, _id, remarks, reason} = a;
      const self = this;
      Promise.resolve()
        .then(() => {
          if(_status === 'rejected') {
            this.checkString(reason, {
              name: '理由',
              minLength: 1,
              maxLength: 1000
            });
          }
          return nkcAPI('/nkc/securityApplication', 'POST', {
            applicationId: _id,
            remarks,
            reason,
            status: _status
          });
        })
        .then(() => {
          a.status = _status;
        })
        .catch(sweetError);
    }
  },
  updated() {
    floatUserPanel.initPanel();
  }
})

window.app = app;
