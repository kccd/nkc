import { sweetError, sweetSuccess } from '../../lib/js/sweetAlert';
var data = NKC.methods.getDataById('data');
for (var i = 0; i < data.logs.length; i++) {
  data.logs[i].modify = false;
  data.logs[i].editReason = '';
}
var app = new Vue({
  el: '#app',
  data: {
    logs: data.logs,
    c: data.c || '',
    t: data.t || 'username',
  },
  mounted: function () {},
  methods: {
    format: NKC.methods.format,
    search: function () {
      var t = this.t;
      var c = this.c;
      var url = '/e/log/dismoment?t=' + t + '&c=' + c;
      NKC.methods.visitUrl(url, false);
    },
    reset: function () {
      NKC.methods.visitUrl('/e/log/dismoment', false);
    },
    saveReason($index) {
      const self = this;
      const { _id, editReason } = this.logs[$index];
      nkcAPI(`/e/log/dismoment/reason`, 'PUT', { id: _id, reason: editReason })
        .then(() => {
          sweetSuccess('修改成功');
          self.logs[$index].reason = editReason;
        })
        .catch(sweetError);
    },
    editReason($index) {
      this.logs[$index].modify = true;
      this.logs[$index].editReason = this.logs[$index].reason;
    },
    editCancel($index) {
      this.logs[$index].modify = false;
      this.logs[$index].editReason = '';
    },
    recover($index) {
      const self = this;
      const id = this.logs[$index].momentId;
      nkcAPI(`/moment/${id}/recovery`, 'POST')
        .then(() => {
          sweetSuccess('解除屏蔽成功');
          self.logs[$index].recovered = true;
        })
        .catch(sweetError);
    },
  },
});
